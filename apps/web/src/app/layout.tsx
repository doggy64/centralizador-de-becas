import Link from 'next/link';
import type { ReactNode } from 'react';
import './styles.css';

export const metadata = {
  title: { default: 'Becas en ruta', template: '%s | Becas en ruta' },
  description: 'Encuentra convocatorias y revisa sus fechas, requisitos y vías oficiales para postular.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="es"><body>
    <a className="skip" href="#contenido">Saltar al contenido</a>
    <header><nav aria-label="Principal">
      <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">B</span><span>Becas en ruta</span></Link>
      <Link href="/becas">Buscar becas</Link>
    </nav></header>
    <main id="contenido" tabIndex={-1}>{children}</main>
    <footer>Oportunidades académicas, con su fuente y condiciones a la vista.</footer>
  </body></html>;
}
