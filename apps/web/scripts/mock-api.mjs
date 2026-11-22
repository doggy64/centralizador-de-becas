/**
 * API HTTP simulada para Next.js Server Components y pruebas locales.
 * SOLO desarrollo. No subir como servicio de producción.
 * Ejecutar desde la raíz del repositorio:
 *   node apps/web/scripts/mock-api.mjs
 *
 * Las fixtures son becas completamente inventadas y se restringen al loopback.
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const FIXTURE_PATH = new URL('../mock/fixtures/scholarships.json', import.meta.url);
const { items, filters } = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8'));
if (process.env.NODE_ENV === 'production') {
  throw new Error('Servidor de pruebas bloqueado en entorno production');
}
const port = Number(process.env.MOCK_API_PORT || 4010);
const host = '127.0.0.1';
const VALID = {
  modality: new Set(['ON_SITE', 'ONLINE', 'HYBRID', 'UNKNOWN']),
  coverage: new Set(['FULL', 'PARTIAL', 'UNKNOWN']),
  status: new Set(['OPEN', 'UPCOMING', 'CLOSED', 'TO_CONFIRM']),
};
const fold = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const withoutDetails = ({ requirements, requiredDocuments, benefits, applicationChannels, sourceOriginalUrl, sourceTitle, ...card }) => card;
const respond = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
};
const error = (res, status, code, message) => respond(res, status, { error: { code, message, requestId: null } });

function validateSearch(searchParams) {
  const allowed = new Set(['q', 'level', 'area', 'country', 'modality', 'coverage', 'status', 'page', 'limit']);
  for (const key of searchParams.keys()) {
    if (!allowed.has(key)) return `Parámetro desconocido: ${key}`;
  }
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '12');
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > 48) return 'Paginación inválida';
  if ((searchParams.get('q') ?? '').length > 120) return 'Búsqueda demasiado larga';
  const catalogs = {
    level: new Set(filters.levels.map((x) => x.value)),
    area: new Set(filters.areas.map((x) => x.value)),
    country: new Set(filters.countries.map((x) => x.value)),
    ...VALID,
  };
  for (const [key, choices] of Object.entries(catalogs)) {
    const value = searchParams.get(key);
    if (value && !choices.has(value)) return `Filtro ${key} inválido`;
  }
  return null;
}

const server = createServer(async (req, res) => {
  const u = new URL(req.url || '/', `http://${host}:${port}`);
  if (req.method !== 'GET') return error(res, 405, 'METHOD_NOT_ALLOWED', 'Solo se permiten consultas GET');
  if (req.headers['x-mock-scenario'] === 'error') return error(res, 503, 'MOCK_UNAVAILABLE', 'Fallo simulado de la API');
  if (req.headers['x-mock-scenario'] === 'slow') await new Promise((r) => setTimeout(r, 700));

  if (u.pathname === '/health') return respond(res, 200, { status: 'ok' });
  if (u.pathname === '/api/v1/catalogs/filters') return respond(res, 200, filters);

  if (u.pathname === '/api/v1/scholarships') {
    const validationError = validateSearch(u.searchParams);
    if (validationError) return error(res, 400, 'INVALID_QUERY', validationError);
    const q = u.searchParams.get('q');
    const level = u.searchParams.get('level');
    const area = u.searchParams.get('area');
    const country = u.searchParams.get('country');
    const modality = u.searchParams.get('modality');
    const coverage = u.searchParams.get('coverage');
    const status = u.searchParams.get('status');
    const page = Number(u.searchParams.get('page') || '1');
    const limit = Number(u.searchParams.get('limit') || '12');

    const matches = items.filter((s) => {
      if (q && !fold([s.title, s.programName, s.summary, s.institution.name, ...s.areas].join(' ')).includes(fold(q))) return false;
      if (level && !s.levels.includes(level)) return false;
      if (area && !s.areas.includes(area)) return false;
      if (country && !s.destinationCountries.includes(country)) return false;
      if (modality && s.modality !== modality) return false;
      if (coverage && s.coverage !== coverage) return false;
      if (status && s.temporalStatus !== status) return false;
      return true;
    });
    const firstIndex = (page - 1) * limit;
    return respond(res, 200, {
      data: matches.slice(firstIndex, firstIndex + limit).map(withoutDetails),
      meta: { page, limit, total: matches.length, totalPages: Math.ceil(matches.length / limit), hasNextPage: firstIndex + limit < matches.length },
      filters: { q, level, area, country, modality, coverage, status },
    });
  }

  const detail = u.pathname.match(/^\/api\/v1\/scholarships\/([^/]+)$/);
  if (detail) {
    let slug;
    try { slug = decodeURIComponent(detail[1]); }
    catch { return error(res, 400, 'INVALID_SLUG', 'Slug inválido'); }
    const scholarship = items.find((s) => s.slug === slug);
    return scholarship ? respond(res, 200, scholarship) : error(res, 404, 'NOT_FOUND', 'Convocatoria no disponible');
  }

  return error(res, 404, 'NOT_FOUND', 'Ruta no disponible');
});

server.listen(port, host, () => {
  console.log(`API DEMO (no producción) disponible en http://${host}:${port}`);
});
