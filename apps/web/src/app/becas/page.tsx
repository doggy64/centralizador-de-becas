import MobileFilters from '../../components/MobileFilters';
import RateLimitNotice from '../../components/RateLimitNotice';
import ArrowIcon from '../../components/ArrowIcon';
import { encodeFilters } from '../../lib/api/query';
import Link from 'next/link';
import SearchForm from '../../components/SearchForm';
import TemporalStatus from '../../components/TemporalStatus';
import Pagination from '../../components/Pagination';
import FiltersForm from '../../components/FiltersForm';
import ActiveFilters from '../../components/ActiveFilters';
import { getCatalogFilters, searchScholarships, type SearchParams } from '../../lib/api/scholarships';
import { ScholarshipApiError } from '../../lib/api/client';
import { uniqueScholarshipEditions } from '../../lib/unique-scholarship-editions';

type FilterItem = { value: string; label: string };

export default async function Catalog({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  let results;
  let catalogs;
  try {
    [results, catalogs] = await Promise.all([searchScholarships(params), getCatalogFilters()]);
  } catch (error) {
    if (error instanceof ScholarshipApiError && error.status === 429) return <RateLimitNotice />;
    if (!(error instanceof ScholarshipApiError && error.status === 400)) throw error;
    return <section className="scholarship-not-found"><h1>Búsqueda no válida</h1><p>Revisa los parámetros o vuelve a buscar.</p><SearchForm compact /></section>;
  }
  const scholarships = uniqueScholarshipEditions(results.data);
  const queryString = encodeFilters(params);
  const returnQuery = queryString ? '?return=' + encodeURIComponent('/becas?' + queryString) : '';
  const labels = (values: string[], options: FilterItem[]) =>
    values.map(value => options.find(option => option.value === value)?.label ?? value).join(', ') || 'Por confirmar';

  return <>
    <section className="catalog-heading">
      <p className="eyebrow"><span>Catálogo</span> Convocatorias</p>
      <div><h1>Encuentra una beca a tu medida</h1><p>Compara destinos, coberturas y fechas en un mismo mapa.</p></div>
      <SearchForm compact query={query} />
    </section>
    <div className="catalog-toolbar">
      <p role="status">Convocatorias encontradas — <strong>{results.meta.total}</strong>{results.filters.q ? ` para «${results.filters.q}»` : ''}</p>
      <MobileFilters key={queryString} catalogs={catalogs} filters={params} />
    </div>
    <section className="catalog-layout">
      <aside className="filters-sidebar" aria-label="Filtros de búsqueda">
        <div className="filters-title"><h2>Filtrar por</h2></div>
        <FiltersForm key={queryString} catalogs={catalogs} filters={params} />
      </aside>
      <div className="catalog-results">
        <ActiveFilters catalogs={catalogs} filters={params} />
        {scholarships.length ? <>
          <div className="catalog-columns" aria-hidden="true"><span>Institución y convocatoria</span><span>Destino</span><span>Nivel</span><span>Cobertura</span><span>Cierre y vigencia</span></div>
          <ul className="cards catalog-list">{scholarships.map(item =>
            <li className="catalog-card" key={item.id}>
              <div className="catalog-card__main"><p>{item.institution.name}</p>
                <h2 style={{viewTransitionName: 'beca-' + item.id}}><Link href={'/becas/' + encodeURIComponent(item.slug) + returnQuery}>{item.title}</Link></h2>
                <p className="card-summary">{item.summary}</p>
              </div>
              <dl className="card-field"><dt>Destino</dt><dd>{labels(item.destinationCountries, catalogs.countries)}</dd></dl>
              <dl className="card-field"><dt>Nivel</dt><dd>{labels(item.levels, catalogs.levels)}</dd></dl>
              <dl className="card-field"><dt>Cobertura</dt><dd>{labels([item.coverage], catalogs.coverages)}</dd></dl>
              <div className="card-field card-field--deadline"><dl><dt>Fecha límite</dt><dd>{item.dates.originalDeadlineText ?? item.dates.deadline ?? 'Por confirmar'}</dd></dl>
                <TemporalStatus status={item.temporalStatus} /></div>
              <span className="card-arrow" aria-hidden="true"><ArrowIcon /></span>
            </li>)}</ul>
          <Pagination page={results.meta.page} totalPages={results.meta.totalPages} hasNextPage={results.meta.hasNextPage} filters={params} />
        </> : <section className="empty-state" aria-labelledby="sin-resultados">
          <span className="empty-compass" aria-hidden="true">✦</span>
          <h2 id="sin-resultados">No encontramos becas</h2><p>Prueba modificar el término o eliminar alguno de los filtros aplicados.</p>
          <Link href="/becas">Limpiar filtros y ver todas las becas</Link>
        </section>}
      </div>
    </section>
  </>;
}
