import ArrowIcon from './ArrowIcon';

export default function SearchForm({ query = '', compact = false }: { query?: string; compact?: boolean }) {
  return <form className={compact ? 'search-form search-form--compact' : 'search-form'} role="search" method="get" action="/becas">
    <label htmlFor="busqueda">¿Qué beca estás buscando?</label>
    <div className="search-controls">
      <div className="search-input-wrap">
        <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
        <input key={query} id="busqueda" aria-label="Buscar becas" type="search" name="q" maxLength={120}
          defaultValue={query} placeholder="Carrera, país o institución" />
      </div>
      <button type="submit">Buscar becas <ArrowIcon /></button>
    </div>
  </form>;
}
