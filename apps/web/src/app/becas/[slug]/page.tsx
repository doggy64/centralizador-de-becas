import Link from 'next/link';
import TemporalStatus from '../../../components/TemporalStatus';
import RequirementList from '../../../components/RequirementList';
import { notFound } from 'next/navigation';
import { getCatalogFilters, getScholarship, type ScholarshipDetail } from '../../../lib/api/scholarships';
import { ScholarshipApiError } from '../../../lib/api/client';

function applicationHref(channel: ScholarshipDetail['applicationChannels'][number]) {
  const value = channel.urlOrEmail;
  if (channel.purpose !== 'APPLY' || channel.verificationStatus !== 'VERIFIED' || !value) return null;
  if (channel.type === 'EMAIL') return /^[^\s@?:#]+@[^\s@?:#]+\.[^\s@?:#]+$/.test(value) ? 'mailto:' + value : null;
  const url = URL.parse(value);
  return url && ['https:', 'http:'].includes(url.protocol) ? url.href : null;
}

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let scholarship;
  let catalogs;
  try {
    [scholarship, catalogs] = await Promise.all([getScholarship(slug), getCatalogFilters()]);
  } catch (error) {
    if (error instanceof ScholarshipApiError && error.status === 404) notFound();
    throw error;
  }
  const href = scholarship.applicationChannels.map(applicationHref).find(Boolean);
  const label = (values: string[], options: { value: string; label: string }[]) =>
    values.map(value => options.find(option => option.value === value)?.label ?? value).join(', ') || 'No especificado';
  return <article><Link href="/becas">Volver al catálogo</Link>
    <h1>{scholarship.title}</h1><p className="organizer">{scholarship.institution.name || 'No especificado'}</p><p>{scholarship.summary || 'No especificado'}</p>
    <dl className="detail-facts">
      <dt>Programa</dt><dd>{scholarship.programName || 'No especificado'}</dd>
      <dt>Edición</dt><dd>{scholarship.editionKey || 'No especificado'}</dd>
      <dt>Nivel académico</dt><dd>{label(scholarship.levels, catalogs.levels)}</dd>
      <dt>Destino</dt><dd>{label(scholarship.destinationCountries, catalogs.countries)}</dd>
      <dt>Modalidad</dt><dd>{catalogs.modalities.find(option => option.value === scholarship.modality)?.label ?? 'No especificado'}</dd>
      <dt>Sitio institucional</dt><dd>{scholarship.institution.websiteUrl
        ? <a href={scholarship.institution.websiteUrl} target="_blank" rel="noopener noreferrer">Visitar sitio institucional</a>
        : 'No especificado'}</dd>
    </dl>
    <p><TemporalStatus status={scholarship.temporalStatus} /></p>
    <RequirementList title="Requisitos de elegibilidad" items={scholarship.requirements} />
    <RequirementList title="Documentos requeridos" items={scholarship.requiredDocuments} />
    {href ? <a className="button" href={href} target="_blank" rel="noopener noreferrer">Postular con la institución</a> : <p>Canal de postulación por confirmar.</p>}
  </article>;
}
