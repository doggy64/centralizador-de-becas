export default function SearchForm({ query = '' }: { query?: string }) {
  return <form role="search" method="get" action="/becas">
    <label htmlFor="busqueda">Buscar becas</label>
    <div className="search-row"><input id="busqueda" type="search" name="q" maxLength={120}
      defaultValue={query} placeholder="Área de estudio o institución" />
      <button type="submit">Buscar</button></div>
  </form>;
}
