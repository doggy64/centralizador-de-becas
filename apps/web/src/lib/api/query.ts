export type SearchParams = Record<string, string | string[] | undefined>;

export function encodeFilters(filters: SearchParams): string {
  const allowed = ['q', 'level', 'area', 'country', 'modality', 'coverage', 'status', 'page', 'limit'];
  const query = new URLSearchParams();
  for (const key of allowed) {
    const raw = filters[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value?.trim()) query.set(key, value.trim());
  }
  return query.toString();
}
