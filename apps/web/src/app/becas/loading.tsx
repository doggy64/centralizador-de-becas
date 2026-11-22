export default function Loading() {
  return <section aria-busy="true" aria-live="polite">
    <p role="status">Cargando becas…</p>
    <div className="skeleton-card" aria-hidden="true" />
    <div className="skeleton-card" aria-hidden="true" />
  </section>;
}
