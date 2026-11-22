import Link from 'next/link';

const statusLabels = {
  QUEUED: 'En cola', RUNNING: 'En ejecución', DONE: 'Completada', DONE_WITH_ISSUES: 'Completada con incidencias',
};
const resultLabels: Record<string, string> = {
  PUBLISHED: 'Publicada', NEEDS_REVIEW: 'Requiere revisión', SOURCE_REVIEW: 'Fuente pendiente de autorización',
  SKIPPED: 'Omitida', ERROR: 'Error',
};
export type Job = {
  id: string; query: string; createdAt: string; status: keyof typeof statusLabels;
  report: {
    published?: number; pending?: number;
    documents?: { requested: number; parsed: number; reused: number };
    results?: { url: string; status: string; reason?: string; slug?: string }[];
  };
};
function Counter({ label, value }: { label: string; value: number }) {
  return <div className="job-counter"><span>{label}</span><strong key={value}>{value.toLocaleString('es')}</strong></div>
}

export function EmptyReport() {
  return (
    <div className="empty-report">
      <span aria-hidden="true">⌁</span>
      <h2>Consulta un trabajo</h2>
      <p>Introduce un ID para recuperar su avance y el informe de fuentes.</p>
    </div>
  )
}

export default function JobReport({ job }: { job: Job }) {
  const running = job.status === 'QUEUED' || job.status === 'RUNNING'
  return (
    <div className="job-report" aria-live="polite">
      <div className="job-overview">
        <div><span>Consulta</span><strong>{job.query}</strong></div>
        <div><span>Creación</span><strong>{new Date(job.createdAt).toLocaleString('es-BO')}</strong></div>
        <div><span>Estado</span><strong className={`job-status job-status--${job.status.toLowerCase()}`}><i />{statusLabels[job.status]}</strong></div>
      </div>
      <div className={`activity-line${running ? ' activity-line--running' : ''}`} aria-label={running ? 'Trabajo en curso' : 'Trabajo finalizado'}><i /></div>

      <section className="job-section">
        <div className="job-section-title"><span>01</span><h2>Fichas</h2></div>
        <div className="counter-grid counter-grid--records">
          <Counter label="Publicadas" value={job.report.published ?? 0} />
          <Counter label="Pendientes" value={job.report.pending ?? 0} />
        </div>
      </section>
      <section className="job-section">
        <div className="job-section-title"><span>02</span><h2>Documentos</h2></div>
        <div className="counter-grid">
          <Counter label="Solicitados" value={job.report.documents?.requested ?? 0} />
          <Counter label="Procesados" value={job.report.documents?.parsed ?? 0} />
          <Counter label="Reutilizados" value={job.report.documents?.reused ?? 0} />
        </div>
      </section>
      <section className="job-section">
        <div className="job-section-title"><span>03</span><h2>Fuentes consultadas</h2></div>
        {job.report.results?.length ? (
          <div className="source-results">
            {job.report.results.map((source, index) => (
              <article key={source.url + index}>
                <div className={`source-result source-result--${source.status.toLowerCase()}`}><i />{resultLabels[source.status] ?? source.status}</div>
                {source.url && <a href={source.url} target="_blank" rel="noreferrer">{source.url}</a>}
                <p>{source.reason || 'Sin observaciones adicionales.'}</p>
                {source.status === 'PUBLISHED' && source.slug && <Link className="public-record" href={'/becas/' + encodeURIComponent(source.slug)}>Ver ficha pública →</Link>}
              </article>
            ))}
          </div>
        ) : <p className="sources-waiting">{running ? 'Las fuentes aparecerán a medida que sean procesadas.' : 'No se recibieron fuentes.'}</p>}
      </section>
    </div>
  )
}
