/**
 * La API consolida las fuentes de una convocatoria. Como salvaguarda de
 * presentación, no renderizamos dos tarjetas que identifiquen la misma edición
 * con el mismo slug. No fusionamos ni recalculamos los datos de la API.
 */
export function uniqueScholarshipEditions<T extends { slug: string }>(items: readonly T[]): T[] {
  const renderedSlugs = new Set<string>();
  return items.filter(item => {
    if (renderedSlugs.has(item.slug)) return false;
    renderedSlugs.add(item.slug);
    return true;
  });
}
