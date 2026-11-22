import type { ReactNode } from 'react';
import './styles.css';

export const metadata = {
  title: { default: 'Centralizador de Becas', template: '%s | Centralizador de Becas' },
  description: 'Busca convocatorias y consulta cómo postular.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="es" data-scroll-behavior="smooth"><body>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    {children}
  </body></html>;
}
