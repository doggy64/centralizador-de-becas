import Link from 'next/link';
export default function NotFound() {
  return <section className="scholarship-not-found"><span>404</span><h1>Página no disponible</h1>
    <p>La convocatoria puede haber cambiado de dirección o haberse retirado.</p>
    <Link href="/becas">Volver al catálogo</Link></section>;
}
