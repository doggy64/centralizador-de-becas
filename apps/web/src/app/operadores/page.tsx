'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '../../components/operators/AdminShell';
import { operatorError } from '../../lib/operator-error';

export default function NewSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [publish, setPublish] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [error, setError] = useState('');
  const [requestKey, setRequestKey] = useState('');
  const [lastBody, setLastBody] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (query.trim().length < 3) {
      setValidationError('Escribe al menos 3 caracteres para iniciar una búsqueda.');
      return;
    }
    const body = JSON.stringify({ query: query.trim(), publish });
    const key = requestKey && body === lastBody ? requestKey : crypto.randomUUID();
    setRequestKey(key);
    setLastBody(body);
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/operadores/api/busquedas', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body,
      });
      if (!response.ok) {
        if (response.status === 409) setRequestKey('');
        throw new Error(operatorError(response.status));
      }
      const { id } = await response.json() as { id: string };
      router.push('/operadores/seguimiento?id=' + encodeURIComponent(id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar la búsqueda.');
      setSubmitting(false);
    }
  }
  return (
    <AdminShell section="new">
      <section className="admin-intro">
        <p className="admin-kicker">Ingesta editorial / 01</p>
        <h1>Nueva búsqueda</h1>
        <p>Inicia una búsqueda en fuentes autorizadas. Si el navegador solicita acceso, usa el usuario «operador» y la contraseña de la consola.</p>
      </section>
      <section className="admin-workspace admin-workspace--form">
        <div className="request-meta">
          <span>POST</span><code>/admin/busquedas</code>
        </div>
        <form className="new-search-form" onSubmit={submit}>
          {error && <div className="recoverable-error" role="alert">{error}</div>}
          <label htmlFor="admin-query">Consulta de búsqueda</label>
          <textarea required minLength={3}
            id="admin-query" placeholder="Becas de maestría para postulantes de Bolivia"
            disabled={submitting} value={query}
            maxLength={240}
            onChange={(event) => {
              setQuery(event.target.value.slice(0, 240))
              if (validationError) setValidationError('')
            }}
            aria-describedby={`query-count${validationError ? ' query-error' : ''}`}
            aria-invalid={Boolean(validationError)}
          />
          <div className="query-meta" id="query-count"><span>Entre 3 y 240 caracteres</span><b>{query.length} / 240</b></div>
          {validationError && <p className="field-error" id="query-error" role="alert">{validationError}</p>}

          <label className="publish-toggle">
            <span>
              <strong>Publicar automáticamente</strong>
              <small>Solo se publican fichas de fuentes autorizadas que superen todas las verificaciones.</small>
            </span>
            <input disabled={submitting} type="checkbox" checked={publish} onChange={(event) => setPublish(event.target.checked)} />
            <i aria-hidden="true" />
          </label>

          <div className="payload-preview">
            <span>Cuerpo de la solicitud</span>
            <code>{JSON.stringify({ query, publish })}</code>
          </div>

          <div className="submission-row">
            <p>Idempotency-Key <code>{requestKey || 'Se asigna al enviar'}</code></p>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Enviando…' : 'Iniciar búsqueda'} <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </section>
    </AdminShell>
  )
}
