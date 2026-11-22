import { getApiBaseUrl } from '../../../../../lib/api/client';
import { createHash, timingSafeEqual } from 'node:crypto';

type Context = { params: Promise<{ id?: string[] }> };
const challenge = { 'WWW-Authenticate': 'Basic realm="Operadores de becas", charset="UTF-8"' };

function reply(status: number, headers: Record<string, string> = {}) {
  return new Response(null, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

function digest(value: string) {
  return createHash('sha256').update(value).digest();
}

async function forward(request: Request, path: string) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Basic ')) return reply(401, challenge);
  const credentials = Buffer.from(auth.slice(6), 'base64').toString('utf8');
  if (!credentials.startsWith('operador:')) return reply(401, challenge);
  const password = process.env.OPERATOR_PASSWORD;
  const token = process.env.SEARCH_ADMIN_TOKEN;
  if (!password || !token) return reply(503);
  if (!timingSafeEqual(digest(credentials.slice('operador:'.length)), digest(password))) return reply(401, challenge);
  const headers = new Headers({ Authorization: 'Bearer ' + token, Accept: 'application/json' });
  let body: string | undefined;
  if (request.method === 'POST') {
    if (request.headers.get('origin') !== new URL(request.url).origin) return reply(403);
    if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') return reply(415);
    headers.set('Content-Type', 'application/json');
    const key = request.headers.get('Idempotency-Key');
    if (key) headers.set('Idempotency-Key', key);
    body = await request.text();
  }
  try {
    const response = await fetch(new URL(path, getApiBaseUrl()), {
      method: request.method, headers, body, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
    });
    if (response.status === 401) return reply(401, challenge);
    return new Response(response.body, { status: response.status,
      headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' } });
  } catch {
    return reply(503);
  }
}

export async function POST(request: Request, context: Context) {
  if ((await context.params).id?.length) return reply(405);
  return forward(request, '/admin/busquedas');
}

export async function GET(request: Request, context: Context) {
  const segments = (await context.params).id;
  if (segments?.length !== 1 || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(segments[0])) return reply(404);
  return forward(request, '/admin/busquedas/' + segments[0]);
}
