/**
 * Tipos derivados del contrato OpenAPI v1. Regenerar desde apps/web con
 * npm run generate:api cuando se integre una revisión del contrato.
 */
import type { paths } from './generated';
import { apiGet } from './client';
import { encodeFilters, type SearchParams } from './query';
export type { SearchParams } from './query';

export type SearchResult = paths['/api/v1/scholarships']['get']['responses'][200]['content']['application/json'];
export type ScholarshipDetail = paths['/api/v1/scholarships/{slug}']['get']['responses'][200]['content']['application/json'];
export type FilterCatalog = paths['/api/v1/catalogs/filters']['get']['responses'][200]['content']['application/json'];

/**
 * La API consolida las fuentes de una convocatoria. Como salvaguarda de
 * presentación, no renderizamos dos tarjetas que identifiquen la misma edición
 * con el mismo slug. No fusionamos ni recalculamos los datos de la API.
 */
export async function searchScholarships(filters: SearchParams): Promise<SearchResult> {
  const query = encodeFilters(filters);
  return apiGet<SearchResult>(`/api/v1/scholarships${query ? `?${query}` : ''}`);
}

export async function getScholarship(slug: string): Promise<ScholarshipDetail> {
  return apiGet<ScholarshipDetail>(`/api/v1/scholarships/${encodeURIComponent(slug)}`);
}

export async function getCatalogFilters(): Promise<FilterCatalog> {
  return apiGet<FilterCatalog>('/api/v1/catalogs/filters');
}
