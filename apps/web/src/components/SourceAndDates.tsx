import type { ScholarshipDetail } from '../lib/api/scholarships';

function formatDate(value: string | null, options: Intl.DateTimeFormatOptions): string {
  if (!value) return 'No especificado';
  return new Intl.DateTimeFormat('es-BO', options).format(new Date(value));
}

export default function SourceAndDates({ scholarship }: { scholarship: ScholarshipDetail }) {
  const { dates } = scholarship;
  const deadline = dates.originalDeadlineText ?? (dates.deadline
    ? formatDate(dates.deadline, { dateStyle: 'long', timeStyle: 'short', timeZone: dates.timeZone ?? undefined })
    : 'Pendiente de verificación');

  return <>
    <section className="detail-section" aria-labelledby="plazos-de-la-convocatoria">
      <p className="section-index">04 / Calendario</p><h2 id="plazos-de-la-convocatoria">Plazos de la convocatoria</h2>
      <dl className="dates-list">
        <dt>Inicio</dt><dd>{dates.startDate ? formatDate(dates.startDate, { dateStyle: 'long', timeZone: 'UTC' }) : 'No especificado'}</dd>
        <dt>Fecha límite</dt><dd>{deadline}</dd>
        {dates.timeZone ? <><dt>Zona horaria</dt><dd>{dates.timeZone}</dd></> : null}
      </dl>
    </section>
    <section className="detail-section" aria-labelledby="fuente-y-verificacion">
      <p className="section-index">05 / Trazabilidad</p><h2 id="fuente-y-verificacion">Fuente y verificación</h2>
      <div className="source-links"><p><a href={scholarship.sourceOriginalUrl} target="_blank" rel="noopener noreferrer">{scholarship.sourceTitle ?? 'Consultar convocatoria original'}</a></p>
      <p>Última revisión: {scholarship.lastVerifiedAt
        ? formatDate(scholarship.lastVerifiedAt, { dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC' })
        : 'Pendiente de verificación'}</p></div>
    </section>
  </>;
}
