import type { ScholarshipDetail } from '../lib/api/scholarships';

type EvidenceData = ScholarshipDetail['requirements'][number]['evidence'];

export default function Evidence({ data }: { data: EvidenceData }) {
  if (!data) return null;
  return <details className="evidence">
    <summary>Ver evidencia</summary>
    {data.excerpt && <blockquote>{data.excerpt}</blockquote>}
    {data.pageNumber && <p>Página {data.pageNumber}</p>}
    <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">Abrir fuente de la evidencia ↗</a>
  </details>;
}
