'use client';
import Link from 'next/link';
import { FormEvent, ReactNode, useState } from 'react'

type Policy = 'MANUAL' | 'AUTHORIZED' | 'DISABLED'
type ReviewState = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'REVERIFY' | 'WITHDRAWN'
type ChannelStatus = 'PENDING' | 'VERIFIED' | 'INVALID' | 'OUTDATED'

type HistoryEvent = {
  id: string
  action: string
  operator: string
  reason: string
  date: string
}

const policyLabels: Record<Policy, string> = {
  MANUAL: 'Uso manual',
  AUTHORIZED: 'Rastreo autorizado',
  DISABLED: 'Deshabilitada',
}

const sourceSeed = [
  { id: 'uni-andina', domain: 'becas.universidadandina.edu', url: 'https://becas.universidadandina.edu/maestria-impacto', policy: 'AUTHORIZED' as Policy },
  { id: 'fundacion-sur', domain: 'fundacionsur.org', url: 'https://fundacionsur.org/convocatorias', policy: 'MANUAL' as Policy },
  { id: 'archivo-global', domain: 'archivo-global.example', url: 'https://archivo-global.example/becas', policy: 'DISABLED' as Policy },
]

const evidence = {
  title: 'Beca Andina de Maestría en Impacto Público',
  requirement: 'La persona postulante deberá acreditar nacionalidad o residencia permanente en Bolivia, Perú o Ecuador.',
  benefit: 'La beca cubre el 100% de la matrícula y contempla un estipendio mensual de USD 900.',
  deadline: 'La recepción de candidaturas finalizará el 30 de septiembre de 2025 a las 17:00 (UTC−4).',
  channel: 'Las postulaciones se recibirán exclusivamente a través del Portal de Admisiones de la Universidad Andina.',
}

function editorialPath(view: string) {
  return `/operadores/editorial/${view}`
}

function EditorialShell({ children, active }: { children: ReactNode; active: string }) {
  return (
    <main id="contenido" tabIndex={-1} className="admin-shell editorial-shell">
      <header className="admin-header">
        <Link className="admin-brand" href="/operadores">
          <span aria-hidden="true">C</span><strong>Centralizador</strong><small>Consola de operadores</small>
        </Link>
        <nav aria-label="Navegación de operadores">
          <Link href="/operadores">Nueva búsqueda</Link><Link href="/operadores/seguimiento">Seguimiento</Link>
          <Link className="is-active" href={editorialPath('fuentes')}>Prototipo editorial</Link>
        </nav>
        <div className="operator-id"><i aria-hidden="true" /> Operador demo</div>
      </header>
      <div className="editorial-heading">
        <div><p>Operaciones del worker / interfaz experimental</p><h1>Prototipo editorial</h1></div>
        <nav aria-label="Secciones editoriales">
          <Link className={active === 'fuentes' ? 'is-active' : ''} href={editorialPath('fuentes')}><span>01</span> Fuentes</Link>
          <Link className={active === 'ingesta' ? 'is-active' : ''} href={editorialPath('ingesta')}><span>02</span> Ingesta e inspección</Link>
          <Link className={active === 'revision' ? 'is-active' : ''} href={editorialPath('revision')}><span>03</span> Revisión editorial</Link>
        </nav>
      </div>
      {children}
      <footer className="admin-footer"><span>Estado local · Datos de demostración</span><Link href="/operadores">Salir del prototipo editorial</Link></footer>
    </main>
  )
}

function DecisionPanel({
  title, actionLabel = 'Guardar cambio', onClose, onSave,
}: {
  title: string
  actionLabel?: string
  onClose: () => void
  onSave: (operator: string, reason: string) => void
}) {
  const [operator, setOperator] = useState('Marina López')
  const [reason, setReason] = useState('')

  return (
    <div className="decision-layer" role="dialog" aria-modal="true" aria-labelledby="decision-title">
      <button className="decision-backdrop" aria-label="Cerrar panel" onClick={onClose} />
      <aside className="decision-panel">
        <div className="decision-panel__head">
          <p>Registro de decisión</p><button onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <h2 id="decision-title">{title}</h2>
        <label>Operador<input value={operator} onChange={(event) => setOperator(event.target.value)} /></label>
        <label>Motivo<textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Describe el fundamento del cambio…" /></label>
        <button className="decision-save" disabled={!operator.trim() || !reason.trim()} onClick={() => onSave(operator.trim(), reason.trim())}>{actionLabel}</button>
      </aside>
    </div>
  )
}

function SourcesView() {
  const [sources, setSources] = useState(() => {
    const stored = localStorage.getItem('editorial-sources')
    return stored ? JSON.parse(stored) as typeof sourceSeed : sourceSeed
  })
  const [pending, setPending] = useState<{ id: string; policy: Policy } | null>(null)
  const [highlighted, setHighlighted] = useState('')

  function savePolicy(operator: string, reason: string) {
    if (!pending) return
    const updated = sources.map((source) => source.id === pending.id ? { ...source, policy: pending.policy } : source)
    setSources(updated)
    localStorage.setItem('editorial-sources', JSON.stringify(updated))
    localStorage.setItem('editorial-source-decision', JSON.stringify({ operator, reason, policy: pending.policy }))
    setHighlighted(pending.id)
    setPending(null)
    window.setTimeout(() => setHighlighted(''), 1400)
  }

  return (
    <EditorialShell active="fuentes">
      <section className="editorial-intro">
        <div><p className="admin-kicker">Gobernanza de origen</p><h2>Fuentes</h2></div>
        <p>Define qué dominios puede consultar el proceso editorial antes de descubrir candidatos.</p>
      </section>
      <section className="editorial-surface">
        <div className="editorial-table-head"><span>Dominio y URL oficial</span><span>Política</span><span>Último cambio</span></div>
        <div className="sources-table">
          {sources.map((source) => (
            <article className={highlighted === source.id ? 'source-row source-row--updated' : 'source-row'} key={source.id}>
              <div><strong>{source.domain}</strong><a href={source.url} target="_blank" rel="noreferrer">{source.url} ↗</a></div>
              <label>
                <span className={`policy-dot policy-dot--${source.policy.toLowerCase()}`} />
                <select value={source.policy} onChange={(event) => setPending({ id: source.id, policy: event.target.value as Policy })}>
                  {Object.entries(policyLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
              </label>
              <time>{highlighted === source.id ? 'Ahora · Marina López' : '12 jun 2025'}</time>
            </article>
          ))}
        </div>
        <div className="editorial-next"><span>La Universidad Andina ya está autorizada.</span><Link href={editorialPath('ingesta')}>Continuar a ingesta <b>→</b></Link></div>
      </section>
      {pending && <DecisionPanel title={`Cambiar política a “${policyLabels[pending.policy]}”`} onClose={() => setPending(null)} onSave={savePolicy} />}
    </EditorialShell>
  )
}

type EvidenceKey = 'requirement' | 'benefit' | 'deadline' | 'channel'

const extractedFields: Array<{ key: EvidenceKey; label: string; value: string }> = [
  { key: 'requirement', label: 'Requisito', value: 'Nacionalidad o residencia en Bolivia, Perú o Ecuador' },
  { key: 'benefit', label: 'Beneficio', value: 'Matrícula completa y estipendio de 900 USD mensuales' },
  { key: 'deadline', label: 'Cierre', value: '30 de septiembre de 2025 · 17:00 UTC−4' },
  { key: 'channel', label: 'Canal', value: 'Portal de Admisiones de la Universidad Andina' },
]

function SourceDocument({ selected }: { selected: EvidenceKey }) {
  return (
    <div className="source-document">
      <header><span>PDF · 8 páginas</span><b>Página 3 de 8</b></header>
      <div className="document-page">
        <p className="document-overline">Universidad Andina · Convocatoria 2025–2026</p>
        <h3>{evidence.title}</h3>
        <p>La Universidad Andina abre su convocatoria regional para estudios de posgrado orientados al fortalecimiento del sector público.</p>
        <h4>2. Elegibilidad</h4>
        <p className={selected === 'requirement' ? 'evidence-fragment is-selected' : 'evidence-fragment'}>{evidence.requirement}</p>
        <h4>3. Cobertura</h4>
        <p className={selected === 'benefit' ? 'evidence-fragment is-selected' : 'evidence-fragment'}>{evidence.benefit}</p>
        <h4>5. Calendario y postulación</h4>
        <p className={selected === 'deadline' ? 'evidence-fragment is-selected' : 'evidence-fragment'}>{evidence.deadline}</p>
        <p className={selected === 'channel' ? 'evidence-fragment is-selected' : 'evidence-fragment'}>{evidence.channel}</p>
      </div>
    </div>
  )
}

function IngestionView() {
  const [url, setUrl] = useState(sourceSeed[0].url)
  const [discovered, setDiscovered] = useState(false)
  const [selected, setSelected] = useState<EvidenceKey>('requirement')
  const [imported, setImported] = useState(localStorage.getItem('editorial-candidate') === 'imported')

  function discover(event: FormEvent) {
    event.preventDefault()
    setDiscovered(false)
    window.setTimeout(() => setDiscovered(true), 550)
  }

  function importCandidate() {
    localStorage.setItem('editorial-candidate', 'imported')
    setImported(true)
  }

  return (
    <EditorialShell active="ingesta">
      <section className="editorial-intro">
        <div><p className="admin-kicker">Descubrimiento y extracción</p><h2>Ingesta e inspección</h2></div>
        <form className="discovery-form" onSubmit={discover}>
          <label htmlFor="source-url">URL autorizada</label>
          <div><input id="source-url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} /><button>Simular descubrimiento</button></div>
        </form>
      </section>
      {!discovered ? (
        <section className="editorial-surface ingestion-empty">
          <span aria-hidden="true">⌁</span><h3>Documento listo para descubrir</h3>
          <p>Ejecuta la simulación para inspeccionar el origen y sus campos extraídos.</p>
        </section>
      ) : (
        <section className="inspection-workspace">
          <SourceDocument selected={selected} />
          <div className="extracted-panel">
            <header><div><span>Candidato detectado</span><h3>{evidence.title}</h3></div><b>Confianza 94%</b></header>
            <div className="extracted-fields">
              {extractedFields.map((field) => (
                <button className={selected === field.key ? 'extracted-field is-selected' : 'extracted-field'} key={field.key} onClick={() => setSelected(field.key)}>
                  <span>{field.label}</span><strong>{field.value}</strong><i>Ver evidencia →</i>
                  <blockquote>“{evidence[field.key]}”</blockquote>
                </button>
              ))}
            </div>
            <div className="import-row">
              <p>{imported ? 'Candidato importado y disponible para revisión.' : 'La importación no publica la ficha.'}</p>
              {imported ? <Link href={editorialPath('revision')}>Abrir revisión <b>→</b></Link> : <button onClick={importCandidate}>Importar candidato</button>}
            </div>
          </div>
        </section>
      )}
    </EditorialShell>
  )
}

const actionLabels: Record<string, string> = {
  review: 'Enviar a revisión', publish: 'Publicar', reject: 'Rechazar',
  reverify: 'Solicitar reverificación', withdraw: 'Retirar',
}

function availableActions(state: ReviewState) {
  if (state === 'DRAFT' || state === 'REJECTED') return ['review']
  if (state === 'IN_REVIEW' || state === 'REVERIFY') return ['publish', 'reject', 'reverify']
  if (state === 'PUBLISHED') return ['reverify', 'withdraw']
  return ['review']
}

function ReviewView() {
  const [reviewState, setReviewState] = useState<ReviewState>('IN_REVIEW')
  const [channelStatus, setChannelStatus] = useState<ChannelStatus>('PENDING')
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceKey>('requirement')
  const [pendingAction, setPendingAction] = useState<{ type: 'decision' | 'channel'; value: string } | null>(null)
  const [latestEvent, setLatestEvent] = useState('')
  const [history, setHistory] = useState<HistoryEvent[]>([{
    id: 'seed', action: 'Candidato importado y enviado a revisión', operator: 'Worker editorial',
    reason: 'Fuente autorizada; extracción con confianza alta.', date: '18 jun 2025 · 15:04',
  }])

  function addEvent(operator: string, reason: string) {
    if (!pendingAction) return
    let action = ''
    if (pendingAction.type === 'channel') {
      const value = pendingAction.value as ChannelStatus
      setChannelStatus(value)
      action = `Canal marcado como ${value === 'VERIFIED' ? 'verificado' : value === 'INVALID' ? 'inválido' : 'desactualizado'}`
    } else {
      action = actionLabels[pendingAction.value]
      const next: Record<string, ReviewState> = { review: 'IN_REVIEW', publish: 'PUBLISHED', reject: 'REJECTED', reverify: 'REVERIFY', withdraw: 'WITHDRAWN' }
      setReviewState(next[pendingAction.value])
    }
    const event = { id: crypto.randomUUID(), action, operator, reason, date: 'Ahora' }
    setHistory((current) => [event, ...current])
    setLatestEvent(event.id)
    setPendingAction(null)
    window.setTimeout(() => setLatestEvent(''), 1200)
  }

  return (
    <EditorialShell active="revision">
      <section className="editorial-intro review-intro">
        <div><p className="admin-kicker">Decisión humana</p><h2>Revisión editorial</h2></div>
        <div className={`review-state review-state--${reviewState.toLowerCase()}`}><i />{reviewState === 'IN_REVIEW' ? 'En revisión' : reviewState === 'PUBLISHED' ? 'Publicada' : reviewState === 'REVERIFY' ? 'Reverificación solicitada' : reviewState === 'WITHDRAWN' ? 'Retirada' : reviewState === 'REJECTED' ? 'Rechazada' : 'Borrador'}</div>
      </section>
      <section className="review-workspace">
        <div className="review-record">
          <p className="record-institution">Universidad Andina · Edición 2025–2026</p>
          <h3>{evidence.title}</h3>
          <p>Programa regional para fortalecer capacidades de gestión e impacto público mediante estudios de maestría.</p>
          <dl><div><dt>Destino</dt><dd>Bolivia, Perú y Ecuador</dd></div><div><dt>Nivel</dt><dd>Maestría</dd></div><div><dt>Cobertura</dt><dd>Completa + 900 USD</dd></div><div><dt>Cierre</dt><dd>30 sep 2025 · 17:00 UTC−4</dd></div></dl>
          <div className="review-evidence">
            <h4>Evidencia de la ficha</h4>
            {extractedFields.slice(0, 3).map((field) => (
              <button className={selectedEvidence === field.key ? 'is-selected' : ''} onClick={() => setSelectedEvidence(field.key)} key={field.key}>
                <span>{field.label}</span><strong>{field.value}</strong>
                <blockquote>“{evidence[field.key]}”</blockquote>
              </button>
            ))}
          </div>
        </div>
        <aside className="review-source">
          <p>Fragmento seleccionado</p><blockquote key={selectedEvidence}>“{evidence[selectedEvidence]}”</blockquote><span>Página 3 · Convocatoria oficial</span>
          <a href={sourceSeed[0].url} target="_blank" rel="noreferrer">Abrir documento original ↗</a>
        </aside>
      </section>
      <section className="channel-section editorial-surface">
        <div><p className="admin-kicker">Canal de postulación</p><h3>Portal de Admisiones</h3><a href="https://becas.universidadandina.edu/postular" target="_blank" rel="noreferrer">becas.universidadandina.edu/postular ↗</a></div>
        <div className={`channel-status channel-status--${channelStatus.toLowerCase()}`}><span>Estado actual</span><strong><i />{channelStatus === 'PENDING' ? 'Pendiente' : channelStatus === 'VERIFIED' ? 'Verificado' : channelStatus === 'INVALID' ? 'Inválido' : 'Desactualizado'}</strong></div>
        <div className="channel-actions">
          <button onClick={() => setPendingAction({ type: 'channel', value: 'VERIFIED' })}>Verificar</button>
          <button onClick={() => setPendingAction({ type: 'channel', value: 'INVALID' })}>Marcar inválido</button>
          <button onClick={() => setPendingAction({ type: 'channel', value: 'OUTDATED' })}>Desactualizado</button>
        </div>
      </section>
      <section className="decision-section">
        <div className="editorial-actions">
          <p className="admin-kicker">Acciones disponibles</p>
          <div>{availableActions(reviewState).map((action) => <button className={action === 'publish' ? 'is-primary' : ''} key={action} onClick={() => setPendingAction({ type: 'decision', value: action })}>{actionLabels[action]}</button>)}</div>
        </div>
        <div className="decision-history">
          <h3>Historial de decisiones</h3>
          {history.map((event) => (
            <article className={latestEvent === event.id ? 'history-event history-event--new' : 'history-event'} key={event.id}>
              <i /><div><strong>{event.action}</strong><p>{event.reason}</p><span>{event.operator} · {event.date}</span></div>
            </article>
          ))}
        </div>
      </section>
      {pendingAction && <DecisionPanel title={pendingAction.type === 'channel' ? 'Registrar verificación del canal' : actionLabels[pendingAction.value]} actionLabel="Registrar decisión" onClose={() => setPendingAction(null)} onSave={addEvent} />}
    </EditorialShell>
  )
}

export default function EditorialConsole({ section }: { section: string }) {
  if (section === 'ingesta') return <IngestionView />;
  if (section === 'revision') return <ReviewView />;
  return <SourcesView />;
}
