import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { Database } from "./scholarships";

const input = z
  .object({
    query: z.string().trim().min(3).max(240),
    publish: z.boolean().default(false),
  })
  .strict();
function authorize(header?: string) {
  const token = process.env.SEARCH_ADMIN_TOKEN;
  const digest = (s: string) => createHash("sha256").update(s).digest();
  if (
    !token ||
    token.length < 32 ||
    !timingSafeEqual(digest(header ?? ""), digest("Bearer " + token))
  )
    throw new UnauthorizedException();
}

@Controller("admin/busquedas")
export class SearchJobsController {
  constructor(private readonly db: Database) {}
  @Post()
  @HttpCode(202)
  async start(
    @Headers("authorization") auth: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: unknown,
  ) {
    authorize(auth);
    const data = input.safeParse(body);
    const id = key ?? randomUUID();
    if (!data.success || !z.string().uuid().safeParse(id).success)
      throw new BadRequestException();
    try {
      await this.db.searchJob.create({ data: { id, ...data.data } });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2002"
      )
        throw error;
      const previous = await this.db.searchJob.findUniqueOrThrow({
        where: { id },
      });
      if (
        previous.query !== data.data.query ||
        previous.publish !== data.data.publish
      )
        throw new ConflictException();
    }
    return { id, statusUrl: "/admin/busquedas/" + id };
  }

  @Get(":id")
  async status(
    @Headers("authorization") auth: string,
    @Param("id") id: string,
  ) {
    authorize(auth);
    const job = await this.db.searchJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException();
    return job;
  }
}
