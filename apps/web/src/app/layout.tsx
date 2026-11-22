import Link from 'next/link';
import type { ReactNode } from 'react';
import './styles.css';

export const metadata = { title: 'Centralizador de Becas', description: 'Busca convocatorias y consulta cómo postular.' };

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="es"><body>
    <a className="skip" href="#contenido">Saltar al contenido</a>
    <header><nav aria-label="Principal">
      <Link className="brand" href="/">Centralizador de Becas</Link>
      <Link href="/becas">Catálogo</Link>
    </nav></header>
    <main id="contenido">{children}</main>
    <footer>Centralizador de Becas</footer>
  </body></html>;
}
