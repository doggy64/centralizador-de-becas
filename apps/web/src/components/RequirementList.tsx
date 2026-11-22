import Evidence from './Evidence';
import type { ScholarshipDetail } from '../lib/api/scholarships';

type Requirement = ScholarshipDetail['requirements'][number];

export default function RequirementList({ title, items }: { title: string; items: Requirement[] }) {
  return <section className="detail-section" aria-labelledby={title.toLowerCase().replaceAll(' ', '-')}>
    <p className="section-index">{title === 'Documentos requeridos' ? '03 / Expediente' : '02 / Perfil'}</p>
    <h2 id={title.toLowerCase().replaceAll(' ', '-')}>{title}</h2>
    {items.length ? <ul className="requirement-list">{items.map((item, index) => <li className="requirement-row" key={`${item.label}-${index}`}>
      <div className="requirement-content"><span className="requirement-type">{item.required === null ? 'Sin especificar' : item.required ? 'Obligatorio' : 'Opcional'}</span><p>{item.label}</p></div>
      <Evidence data={item.evidence} />
    </li>)}</ul> : <p>No especificado.</p>}
  </section>;
}
