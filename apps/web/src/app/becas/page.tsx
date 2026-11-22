import Link from 'next/link';
import SearchForm from '../../components/SearchForm';
import TemporalStatus from '../../components/TemporalStatus';
import { searchScholarships, type SearchParams } from '../../lib/api/scholarships';
import { ScholarshipApiError } from '../../lib/api/client';

export default async function Catalog({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  let results;
  try {
    results = await searchScholarships(params);
  } catch (error) {
    if (!(error instanceof ScholarshipApiError && error.status === 400)) throw error;
    return <><h1>Búsqueda no válida</h1><p>Revisa los parámetros o vuelve a buscar.</p><SearchForm /></>;
  }
  return <><h1>Catálogo de becas</h1><SearchForm query={query} />
    {results.data.length ? <ul className="cards">{results.data.map(item =>
      <li key={item.id}><p>{item.institution.name}</p>
        <h2><Link href={'/becas/' + encodeURIComponent(item.slug)}>{item.title}</Link></h2>
        <p>{item.summary}</p><TemporalStatus status={item.temporalStatus} /></li>)}</ul> :
      <p>No encontramos becas para esta búsqueda. <Link href="/becas">Ver todas las becas</Link></p>}
  </>;
}
