import {
  BadRequestException,
  Controller,
  Get,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  Param,
  Query,
} from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";
import { temporalStatus, isFresh } from "./temporal";

const positive = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .refine(Number.isSafeInteger);
const querySchema = z
  .object({
    q: z.string().max(120),
    level: z.string().min(1).max(100),
    area: z.string().min(1).max(150),
    country: z.string().regex(/^[A-Z]{2}$/),
    modality: z.enum(["ON_SITE", "ONLINE", "HYBRID", "UNKNOWN"]),
    coverage: z.enum(["FULL", "PARTIAL", "UNKNOWN"]),
    status: z.enum(["OPEN", "UPCOMING", "CLOSED", "TO_CONFIRM"]),
    page: positive,
    limit: positive.refine((n) => n <= 48),
  })
  .partial()
  .strict();
const options = {
  modalities: {
    ON_SITE: "Presencial",
    ONLINE: "Virtual",
    HYBRID: "Híbrida",
    UNKNOWN: "No especificada",
  },
  coverages: {
    FULL: "Completa",
    PARTIAL: "Parcial",
    UNKNOWN: "No especificada",
  },
  statuses: {
    OPEN: "Abierta",
    UPCOMING: "Próxima",
    CLOSED: "Cerrada",
    TO_CONFIRM: "Por confirmar",
  },
};
const pairs = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));
const publicWhere: Prisma.ScholarshipWhereInput = {
  status: "PUBLISHED",
  lastVerifiedAt: { not: null },
  source: { approved: true },
  evidence: { none: { source: { approved: false } } },
};
const cardRelations = {
  program: { include: { institution: true } },
  levels: { orderBy: { value: "asc" } },
  areas: { orderBy: { value: "asc" } },
  countries: { orderBy: { value: "asc" } },
} satisfies Prisma.ScholarshipInclude;
type Card = Prisma.ScholarshipGetPayload<{ include: typeof cardRelations }>;
function card(c: Card, now: Date) {
  const values = (items: { value: string }[]) => items.map((i) => i.value);
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    programName: c.program.name,
    editionKey: c.editionKey,
    institution: {
      name: c.program.institution.name,
      websiteUrl: c.program.institution.websiteUrl,
    },
    levels: values(c.levels),
    areas: values(c.areas),
    destinationCountries: values(c.countries),
    modality: c.modality,
    coverage: c.coverage,
    temporalStatus: temporalStatus(c, now),
    dates: {
      startDate: c.startDate,
      deadline: c.deadlineAt?.toISOString() ?? null,
      originalDeadlineText: c.originalDeadlineText,
      precision: c.deadlineAt
        ? "DATETIME"
        : c.deadlineDay
          ? "DATE_ONLY"
          : "UNKNOWN",
      timeZone: c.timeZone,
    },
    lastVerifiedAt: c.lastVerifiedAt?.toISOString() ?? null,
  };
}
@Injectable()
export class Database extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
@Injectable()
export class CatalogService {
  constructor(private readonly db: Database) {}
  async filters() {
    const order = { orderBy: { value: "asc" as const } };
    const [levels, areas, countries] = await this.db.$transaction([
      this.db.academicLevel.findMany(order),
      this.db.studyArea.findMany(order),
      this.db.country.findMany(order),
    ]);
    return {
      levels,
      areas,
      countries,
      modalities: pairs(options.modalities),
      coverages: pairs(options.coverages),
      statuses: pairs(options.statuses),
    };
  }
  async list(raw: unknown) {
    const parsed = querySchema.safeParse(raw);
    if (!parsed.success) throw new BadRequestException();
    const {
      q,
      level,
      area,
      country,
      modality,
      coverage,
      status,
      page = 1,
      limit = 12,
    } = parsed.data;
    const filters = {
      q: q ?? null,
      level: level ?? null,
      area: area ?? null,
      country: country ?? null,
      modality: modality ?? null,
      coverage: coverage ?? null,
      status: status ?? null,
    };
    const cats = await this.filters();
    for (const [value, items] of [
      [level, cats.levels],
      [area, cats.areas],
      [country, cats.countries],
    ] as const)
      if (value && !items.some((item) => item.value === value))
        throw new BadRequestException();
    const folded = q
      ?.normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[\\%_]/g, "\\$&");
    const where: Prisma.ScholarshipWhereInput = {
      ...publicWhere,
      modality,
      coverage,
      searchText: folded ? { contains: folded } : undefined,
      levels: level ? { some: { value: level } } : undefined,
      areas: area ? { some: { value: area } } : undefined,
      countries: country ? { some: { value: country } } : undefined,
    };
    const now = new Date();
    const offset = (page - 1) * limit;
    // El estado depende del reloj. Filtrar antes de paginar usando únicamente los campos de fechas del piloto.
    return this.db.$transaction(
      async (tx) => {
        let ids: string[] | undefined;
        if (status) {
          const dates = await tx.scholarship.findMany({
            where,
            orderBy: { slug: "asc" },
            select: {
              id: true,
              startDate: true,
              deadlineDay: true,
              deadlineAt: true,
              timeZone: true,
              lastVerifiedAt: true,
            },
          });
          ids = dates
            .filter((c) => temporalStatus(c, now) === status)
            .map((c) => c.id);
        }
        const total = ids?.length ?? (await tx.scholarship.count({ where }));
        const data =
          offset >= total
            ? []
            : await tx.scholarship.findMany({
                where: ids
                  ? { ...where, id: { in: ids.slice(offset, offset + limit) } }
                  : where,
                orderBy: { slug: "asc" },
                skip: ids ? 0 : offset,
                take: limit,
                include: cardRelations,
              });
        return {
          data: data.map((c) => card(c, now)),
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: offset + limit < total,
          },
          filters,
        };
      },
      { isolationLevel: "RepeatableRead" },
    );
  }
  async detail(slug: string) {
    if (slug.length > 200) throw new NotFoundException();
    const child = {
      include: { evidence: true },
      orderBy: { id: "asc" as const },
    };
    const c = await this.db.scholarship.findFirst({
      where: { ...publicWhere, slug },
      include: {
        ...cardRelations,
        source: true,
        requirements: child,
        benefits: child,
        channels: child,
      },
    });
    if (!c) throw new NotFoundException();
    const now = new Date();
    const proof = (e: {
      url: string;
      excerpt: string | null;
      pageNumber: number | null;
    }) => ({ sourceUrl: e.url, excerpt: e.excerpt, pageNumber: e.pageNumber });
    const requirements = (document: boolean) =>
      c.requirements
        .filter((r) => r.document === document)
        .map((r) => ({
          label: r.label,
          required: r.required,
          evidence: proof(r.evidence),
        }));
    return {
      ...card(c, now),
      requirements: requirements(false),
      requiredDocuments: requirements(true),
      benefits: c.benefits.map((b) => ({
        description: b.description,
        amount: b.amount,
        currency: b.currency,
        evidence: proof(b.evidence),
      })),
      applicationChannels: c.channels.map((ch) => {
        const verificationStatus =
          ch.verification === "VERIFIED" && !isFresh(ch.verifiedAt, now)
            ? "STALE"
            : ch.verification;
        return {
          type: ch.type,
          purpose: ch.purpose,
          verificationStatus,
          urlOrEmail:
            ch.purpose === "APPLY" && verificationStatus === "VERIFIED"
              ? ch.target
              : null,
          verifiedAt: ch.verifiedAt?.toISOString() ?? null,
          evidence: proof(ch.evidence),
        };
      }),
      sourceTitle: c.source.title,
      sourceOriginalUrl: c.sourceUrl,
    };
  }
}
@Controller("api/v1")
export class ScholarshipsController {
  constructor(private readonly catalog: CatalogService) {}
  @Get("catalogs/filters") filters() {
    return this.catalog.filters();
  }
  @Get("scholarships") list(@Query() q: unknown) {
    return this.catalog.list(q);
  }
  @Get("scholarships/:slug") detail(@Param("slug") slug: string) {
    return this.catalog.detail(slug);
  }
}
