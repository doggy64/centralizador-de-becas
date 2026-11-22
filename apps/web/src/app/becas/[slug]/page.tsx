import Link from 'next/link';
import TemporalStatus from '../../../components/TemporalStatus';
import RateLimitNotice from '../../../components/RateLimitNotice';
import RequirementList from '../../../components/RequirementList';
import BenefitsList from '../../../components/BenefitsList';
import SourceAndDates from '../../../components/SourceAndDates';
import { notFound } from 'next/navigation';
import { getCatalogFilters, getScholarship } from '../../../lib/api/scholarships';
import { ScholarshipApiError } from '../../../lib/api/client';
import ApplicationAction from '../../../components/ApplicationAction';
import VerificationNotice from '../../../components/VerificationNotice';

export default async function Detail({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ return?: string }> }) {
  const { slug } = await params;
  const back = (await searchParams).return;
  const returnTo = typeof back === 'string' && back.startsWith('/becas?') ? back : '/becas';
  let scholarship;
  let catalogs;
  try {
    [scholarship, catalogs] = await Promise.all([getScholarship(slug), getCatalogFilters()]);
  } catch (error) {
    if (error instanceof ScholarshipApiError && error.status === 429) return <RateLimitNotice />;
    if (error instanceof ScholarshipApiError && error.status === 404) notFound();
    throw error;
  }
  const label = (values: string[], options: { value: string; label: string }[]) =>
    values.map(value => options.find(option => option.value === value)?.label ?? value).join(', ') || 'No especificado';
  const facts = [
    ['Programa', scholarship.programName], ['Edición vigente', scholarship.editionKey],
    ['Nivel académico', label(scholarship.levels, catalogs.levels)],
    ['Destino', label(scholarship.destinationCountries, catalogs.countries)],
    ['Área de estudio', label(scholarship.areas, catalogs.areas)],
    ['Modalidad', label([scholarship.modality], catalogs.modalities)],
  ];
  return <article className="scholarship-detail">
    <Link className="detail-back" href={returnTo}>← Volver al catálogo</Link>
    <header className="detail-header">
      <div className="detail-header__main"><p className="eyebrow"><span>{scholarship.institution.name || 'No especificado'}</span></p>
        <TemporalStatus status={scholarship.temporalStatus} />
        <h1 style={{viewTransitionName: 'beca-' + scholarship.id}}>{scholarship.title}</h1>
        <p>{scholarship.summary || 'No especificado'}</p>
      </div>
      <aside className="application-summary"><h2 className="summary-kicker">Resumen de postulación</h2>
        <ol><li>Cobertura: <strong>{label([scholarship.coverage], catalogs.coverages)}</strong></li>
          <li>Cierre: {scholarship.dates.originalDeadlineText ?? scholarship.dates.deadline ?? 'Por confirmar'}</li></ol>
        <ApplicationAction channels={scholarship.applicationChannels} />
      </aside>
      <dl className="key-data detail-facts">
        {facts.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value || 'No especificado'}</dd></div>)}
        <div><dt>Sitio institucional</dt><dd>{scholarship.institution.websiteUrl
          ? <a href={scholarship.institution.websiteUrl} target="_blank" rel="noopener noreferrer">Visitar sitio institucional ↗</a>
          : 'No especificado'}</dd></div>
      </dl>
      <VerificationNotice scholarship={scholarship} />
    </header>
    <div className="detail-body">
      <BenefitsList benefits={scholarship.benefits} />
      <RequirementList title="Requisitos de elegibilidad" items={scholarship.requirements} />
      <RequirementList title="Documentos requeridos" items={scholarship.requiredDocuments} />
      <SourceAndDates scholarship={scholarship} />
    </div>
  </article>;
}
