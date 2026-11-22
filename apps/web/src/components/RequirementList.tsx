import type { ScholarshipDetail } from '../lib/api/scholarships';

type Requirement = ScholarshipDetail['requirements'][number];

export default function RequirementList({ title, items }: { title: string; items: Requirement[] }) {
  return <section className="detail-section" aria-labelledby={title.toLowerCase().replaceAll(' ', '-')}>
    <h2 id={title.toLowerCase().replaceAll(' ', '-')}>{title}</h2>
    {items.length ? <ul>{items.map((item, index) => <li key={`${item.label}-${index}`}>
      <span>{item.label}</span>{item.required === true ? <strong> Obligatorio</strong> : null}
    </li>)}</ul> : <p>No especificado.</p>}
  </section>;
}
