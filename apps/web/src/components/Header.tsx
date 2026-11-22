import Link from 'next/link';
import ArrowIcon from './ArrowIcon';

function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Centralizador de Becas, inicio">
      <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
      <span>Centralizador<br />de Becas</span>
    </Link>
  )
}

export default function Header() {
  return (
    <header className="site-header">
      <Brand />
      <nav aria-label="Navegación principal">
        <Link href="/becas">Convocatorias</Link><Link href="/#como-funciona">Cómo funciona</Link><Link href="/#recursos">Recursos</Link>
      </nav>
      <Link className="header-action" href="/becas">Catálogo <ArrowIcon /></Link>
    </header>
  )
}
