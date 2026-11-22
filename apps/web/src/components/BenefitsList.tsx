import Evidence from './Evidence';
import type { ScholarshipDetail } from '../lib/api/scholarships';

type Benefit = ScholarshipDetail['benefits'][number];

function amountLabel(benefit: Benefit): string | null {
  if (benefit.amount === null || !benefit.currency) return null;
  return `${benefit.amount.toLocaleString('es-BO')} ${benefit.currency}`;
}

export default function BenefitsList({ benefits }: { benefits: Benefit[] }) {
  return <section className="detail-section" aria-labelledby="beneficios-y-costos">
    <p className="section-index">01 / Apoyo</p><h2 id="beneficios-y-costos">Beneficios y costos</h2>
    {benefits.length ? <ul className="benefit-list">{benefits.map((benefit, index) => <li key={`${benefit.description}-${index}`}>
      <span>{benefit.description}</span>{amountLabel(benefit) ? <strong> {amountLabel(benefit)}</strong> : null}
      <Evidence data={benefit.evidence} />
    </li>)}</ul> : <p>No especificado.</p>}
  </section>;
}
