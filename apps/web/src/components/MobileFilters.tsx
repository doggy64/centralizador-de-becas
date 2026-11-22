'use client';

import { useRef } from 'react';
import FiltersForm from './FiltersForm';
import type { FilterCatalog, SearchParams } from '../lib/api/scholarships';

export default function MobileFilters({ catalogs, filters }: { catalogs: FilterCatalog; filters: SearchParams }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button className="mobile-filter-button" type="button" onClick={() => dialog.current?.showModal()}>Filtros</button>
    <dialog className="mobile-filter-dialog" ref={dialog} aria-labelledby="mobile-filters-heading"
      onClose={() => dialog.current?.querySelector('form')?.reset()}
      onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="filter-sheet">
        <div className="sheet-handle" aria-hidden="true" />
        <div className="sheet-title"><h2 id="mobile-filters-heading">Filtros</h2>
          <button aria-label="Cerrar filtros" type="button" onClick={() => dialog.current?.close()}>×</button>
        </div>
        <FiltersForm catalogs={catalogs} filters={filters} onApply={() => dialog.current?.close()} />
      </div>
    </dialog>
  </>;
}
