import Link from 'next/link';
import SearchForm from '../components/SearchForm';

export default function Home() {
  return <section className="intro">
    <h1>Encuentra tu próxima beca</h1>
    <p>Explora convocatorias y consulta cómo postular directamente con la institución que las ofrece.</p>
    <SearchForm />
    <Link href="/becas">Explorar el catálogo</Link>
  </section>;
}
