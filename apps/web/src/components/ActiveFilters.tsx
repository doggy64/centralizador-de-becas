import Link from 'next/link';
import type { FilterCatalog, SearchParams } from '../lib/api/scholarships';

const labels: Record<string, string> = {
  q: 'Búsqueda', level: 'Nivel', area: 'Área', country: 'Destino', modality: 'Modalidad', coverage: 'Cobertura', status: 'Vigencia',
};

const catalogs: Record<string, keyof FilterCatalog> = {
  level: 'levels', area: 'areas', country: 'countries', modality: 'modalities', coverage: 'coverages', status: 'statuses',
};

function valueOf(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function hrefWithout(filters: SearchParams, removed?: string): string {
  const parameters = new URLSearchParams();
  for (const [key, raw] of Object.entries(filters)) {
    const value = valueOf(raw);
    if (key !== removed && key !== 'page' && value?.trim()) parameters.set(key, value.trim());
  }
  return `/becas${parameters.size ? `?${parameters.toString()}` : ''}`;
}

export default function ActiveFilters({ catalogs: options, filters }: { catalogs: FilterCatalog; filters: SearchParams }) {
  const entries = Object.entries(filters).filter(([key, value]) => key in labels && valueOf(value)?.trim());
  if (!entries.length) return null;

  return <section className="active-filters" aria-label="Filtros aplicados">
    <h2>Filtros aplicados</h2>
    <ul>{entries.map(([key, raw]) => {
      const value = valueOf(raw) as string;
      const catalog = catalogs[key];
      const displayed = catalog ? options[catalog].find(option => option.value === value)?.label ?? value : value;
      return <li key={key}><Link href={hrefWithout(filters, key)}>Quitar {labels[key]}: {displayed}</Link></li>;
    })}</ul>
    <Link href="/becas">Limpiar filtros</Link>
  </section>;
}
