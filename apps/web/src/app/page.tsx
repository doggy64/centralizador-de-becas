import Link from 'next/link';

export default function Home() {
  return <section className="intro">
    <h1>Encuentra tu próxima beca</h1>
    <p>Explora convocatorias y consulta cómo postular directamente con la institución que las ofrece.</p>
    <Link href="/becas">Explorar el catálogo</Link>
  </section>;
}
