import AdminShell from '../../../components/operators/AdminShell';
import Tracking from '../../../components/operators/Tracking';

export default async function TrackingPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const jobId = typeof id === 'string' ? id : '';
  return <AdminShell section="tracking">
    <section className="admin-intro admin-intro--tracking">
      <div><p className="admin-kicker">Supervisión / 02</p><h1>Seguimiento</h1></div>
      <form className="job-search" action="/operadores/seguimiento">
        <label htmlFor="job-id">ID del trabajo</label>
        <div><input key={jobId} id="job-id" name="id" required defaultValue={jobId} /><button>Consultar</button></div>
      </form>
    </section>
    <section className="admin-workspace">
      <div className="request-meta"><span>GET</span><code>/admin/busquedas/{'{id}'}</code></div>
      <Tracking key={jobId} id={jobId} />
    </section>
  </AdminShell>;
}
