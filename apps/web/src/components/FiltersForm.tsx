'use client';

import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { FilterCatalog, SearchParams } from '../lib/api/scholarships';

type FilterKey = 'level' | 'area' | 'country' | 'modality' | 'coverage' | 'status';

const definitions: Array<{ key: FilterKey; label: string; catalog: keyof FilterCatalog }> = [
  { key: 'level', label: 'Nivel académico', catalog: 'levels' },
  { key: 'area', label: 'Área de estudio', catalog: 'areas' },
  { key: 'country', label: 'País de destino', catalog: 'countries' },
  { key: 'modality', label: 'Modalidad', catalog: 'modalities' },
  { key: 'coverage', label: 'Cobertura', catalog: 'coverages' },
  { key: 'status', label: 'Vigencia', catalog: 'statuses' },
];

function firstValue(filters: SearchParams, key: FilterKey): string {
  const value = filters[key];
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function FiltersForm({ catalogs, filters, onApply }: { catalogs: FilterCatalog; filters: SearchParams; onApply?: () => void }) {
  const router = useRouter();
  const query = filters.q;
  const q = Array.isArray(query) ? query[0] : query;

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parameters = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget).entries()) {
      if (typeof value === 'string' && value.trim()) parameters.set(key, value.trim());
    }
    onApply?.();
    router.push(`/becas${parameters.size ? `?${parameters.toString()}` : ''}`);
  }

  return <form className="filters" method="get" action="/becas" aria-label="Filtros de becas" onSubmit={applyFilters}>
    {q ? <input type="hidden" name="q" value={q} /> : null}
    {filters.limit && <input type="hidden" name="limit" value={Array.isArray(filters.limit) ? filters.limit[0] : filters.limit} />}
    <fieldset>
      <legend className="visually-hidden">Filtrar convocatorias</legend>
      <div className="filter-fields">{definitions.map(({ key, label, catalog }) => <label key={key}>
        <span>{label}</span>
        <select name={key} defaultValue={firstValue(filters, key)}>
          <option value="">Todos</option>
          {catalogs[catalog].map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>)}</div>
      <button className="apply-filters" type="submit">Aplicar filtros</button>
    </fieldset>
  </form>;
}
