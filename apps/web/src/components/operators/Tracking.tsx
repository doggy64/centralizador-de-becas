'use client';

import { useEffect, useState } from 'react';
import JobReport, { EmptyReport, type Job } from './JobReport';
import { operatorError } from '../../lib/operator-error';

export default function Tracking({ id }: { id: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      try {
        const response = await fetch('/operadores/api/busquedas/' + encodeURIComponent(id), { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error(operatorError(response.status));
        const data: Job = await response.json();
        if (controller.signal.aborted) return;
        setJob(data);
        if (data.status === 'QUEUED' || data.status === 'RUNNING') timer = setTimeout(refresh, 3000);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : operatorError(503));
      }
    }
    void refresh();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [id, attempt]);
  if (!id) return <EmptyReport />;
  return <>
    {error && <div className="recoverable-error" role="alert">{error}
      <button onClick={() => { setError(''); setAttempt(attempt + 1); }}>Reintentar</button></div>}
    {job ? <JobReport job={job} /> : !error && <p role="status">Consultando el trabajo…</p>}
  </>;
}
