import 'server-only';

/**
 * Cliente HTTP de la API para Server Components de Next.js.
 * La misma función se utiliza en modo mock y contra NestJS real.
 */
export class ScholarshipApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ScholarshipApiError';
  }
}

function getApiBaseUrl(): string {
  const configured = process.env.API_BASE_URL;
  if (configured) {
    const url = new URL(configured);
    if (process.env.NODE_ENV === 'production' && ['127.0.0.1', 'localhost'].includes(url.hostname)) {
      throw new Error('API_BASE_URL no puede apuntar a una API mock local en producción');
    }
    return url.origin;
  }
  if (process.env.NODE_ENV !== 'production') return 'http://127.0.0.1:4010';
  throw new Error('Falta configurar API_BASE_URL para producción');
}

export async function apiGet<T>(path: string): Promise<T> {
  if (!path.startsWith('/api/v1/') && path !== '/health') {
    throw new Error('Solo se permiten rutas públicas versionadas de lectura');
  }
  const response = await fetch(new URL(path, getApiBaseUrl()), {
    method: 'GET',
    headers: { accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new ScholarshipApiError(response.status, `La API no respondió correctamente (${response.status})`);
  }
  return (await response.json()) as T;
}
