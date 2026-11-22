export default function Loading() {
  return <section className="catalog-loading" aria-busy="true" aria-live="polite">
    <p role="status">Cargando becas…</p>
    <div className="catalog-skeleton" aria-hidden="true">{[1, 2, 3].map(row =>
      <div key={row} className="skeleton-card"><div><i /><i /><i /></div><i /><i /><i /><i /></div>)}</div>
  </section>;
}
