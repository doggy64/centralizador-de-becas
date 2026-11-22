import Link from 'next/link';

function operatorUrl(path: string) {
  return `/operadores${path}`
}

function AdminMark() {
  return (
    <Link className="admin-brand" href={operatorUrl('')}>
      <span aria-hidden="true">C</span>
      <strong>Centralizador</strong>
      <small>Consola de operadores</small>
    </Link>
  )
}

export default function AdminShell({ children, section }: { children: React.ReactNode; section: 'new' | 'tracking' }) {
  return (
    <main id="contenido" tabIndex={-1} className="admin-shell">
      <header className="admin-header">
        <AdminMark />
        <nav aria-label="Navegación de operadores">
          <Link className={section === 'new' ? 'is-active' : ''} href={operatorUrl('')}>Nueva búsqueda</Link>
          <Link className={section === 'tracking' ? 'is-active' : ''} href={operatorUrl('/seguimiento')}>Seguimiento</Link>
          <Link href={operatorUrl('/editorial/fuentes')}>Prototipo editorial</Link>
        </nav>
        <div className="operator-id"><i aria-hidden="true" /> Operadores</div>
      </header>
      {children}
      <footer className="admin-footer">
        <span>Centralizador de Becas · Operaciones</span><Link href="/">Volver al inicio</Link>
      </footer>
    </main>
  )
}
