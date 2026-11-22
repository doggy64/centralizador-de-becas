import Link from 'next/link';
import TemporalStatus from '../../../components/TemporalStatus';
import { notFound } from 'next/navigation';
import { getScholarship, type ScholarshipDetail } from '../../../lib/api/scholarships';
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
  try {
    scholarship = await getScholarship(slug);
  } catch (error) {
    if (error instanceof ScholarshipApiError && error.status === 404) notFound();
    throw error;
  }
  const href = scholarship.applicationChannels.map(applicationHref).find(Boolean);
  return <article><Link href="/becas">Volver al catálogo</Link>
    <h1>{scholarship.title}</h1><p>{scholarship.institution.name}</p><p>{scholarship.summary}</p>
    <p><TemporalStatus status={scholarship.temporalStatus} /></p>
    {href ? <a className="button" href={href} target="_blank" rel="noopener noreferrer">Postular con la institución</a> : <p>Canal de postulación por confirmar.</p>}
  </article>;
}
