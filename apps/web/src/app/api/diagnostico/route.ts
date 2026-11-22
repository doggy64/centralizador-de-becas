import { getApiBaseUrl } from '../../../../lib/api/client';
import { NextResponse } from 'next/server';

/**
 * Ruta de diagnóstico — solo disponible en producción para verificar
 * que el binding API_BASE_URL está inyectado y la API responde.
 * Eliminar este archivo una vez confirmado el despliegue.
 */
export async function GET() {
  const result: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
    api_base_url_set: !!process.env.API_BASE_URL,
    api_base_url_host: process.env.API_BASE_URL
      ? (() => { try { return new URL(process.env.API_BASE_URL!).host; } catch { return 'URL inválida'; } })()
      : null,
  };

  try {
    const base = getApiBaseUrl();
    result.resolved_base = base;

    const res = await fetch(new URL('/health', base), {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    result.api_health_status = res.status;
    result.api_health_ok = res.ok;
    if (res.ok) result.api_health_body = await res.json();
  } catch (err) {
    result.api_error = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
