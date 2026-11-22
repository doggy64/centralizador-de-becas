import Link from 'next/link';
import SearchForm from '../../components/SearchForm';
import TemporalStatus from '../../components/TemporalStatus';
import Pagination from '../../components/Pagination';
import FiltersForm from '../../components/FiltersForm';
import ActiveFilters from '../../components/ActiveFilters';
import { getCatalogFilters, searchScholarships, type SearchParams } from '../../lib/api/scholarships';
import { ScholarshipApiError } from '../../lib/api/client';
import { uniqueScholarshipEditions } from '../../lib/unique-scholarship-editions';

export default async function Catalog({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  let results;
  let catalogs;
  try {
    [results, catalogs] = await Promise.all([searchScholarships(params), getCatalogFilters()]);
  } catch (error) {
    if (!(error instanceof ScholarshipApiError && error.status === 400)) throw error;
    return <><h1>Búsqueda no válida</h1><p>Revisa los parámetros o vuelve a buscar.</p><SearchForm /></>;
  }
  const scholarships = uniqueScholarshipEditions(results.data);
  return <><h1>Catálogo de becas</h1><SearchForm query={query} />
    <FiltersForm catalogs={catalogs} filters={params} />
    <ActiveFilters catalogs={catalogs} filters={params} />
    <p role="status">Convocatorias encontradas — {results.meta.total}{results.filters.q ? ` para «${results.filters.q}»` : ''}</p>
    {scholarships.length ? <><ul className="cards">{scholarships.map(item =>
      <li key={item.id}><p>{item.institution.name}</p>
        <h2><Link href={'/becas/' + encodeURIComponent(item.slug)}>{item.title}</Link></h2>
        <p>{item.summary}</p>
        <dl>
          <dt>Destino</dt>
          <dd>{item.destinationCountries.map(value => catalogs.countries.find(option => option.value === value)?.label ?? value).join(', ') || 'Por confirmar'}</dd>
          <dt>Nivel de estudios</dt>
          <dd>{item.levels.map(value => catalogs.levels.find(option => option.value === value)?.label ?? value).join(', ') || 'Por confirmar'}</dd>
          <dt>Fecha límite</dt>
          <dd>{item.dates.originalDeadlineText ?? item.dates.deadline ?? 'Por confirmar'}</dd>
        </dl>
        <TemporalStatus status={item.temporalStatus} /></li>)}</ul>
      <Pagination page={results.meta.page} totalPages={results.meta.totalPages} hasNextPage={results.meta.hasNextPage} filters={params} /></> :
      <section aria-labelledby="sin-resultados"><h2 id="sin-resultados">No encontramos becas</h2><p>Prueba modificar el término o eliminar alguno de los filtros aplicados.</p><Link href="/becas">Limpiar filtros y ver todas las becas</Link></section>}
  </>;
}
