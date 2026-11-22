import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';
import ArrowIcon from '../components/ArrowIcon';
import SearchForm from '../components/SearchForm';

function RouteOverlay() {
  return (
    <svg className="route-overlay" aria-hidden="true" viewBox="0 0 600 760" preserveAspectRatio="none">
      <path className="route-shadow" d="M-20 640 C105 610 92 488 211 473 S330 556 401 454 425 279 622 198" />
      <path className="route-line" d="M-20 640 C105 610 92 488 211 473 S330 556 401 454 425 279 622 198" />
      <circle cx="211" cy="473" r="6" /><circle cx="401" cy="454" r="6" /><circle cx="553" cy="241" r="10" />
    </svg>
  )
}

export default function Home() {
  return (
    <><Header /><main id="contenido" tabIndex={-1}>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span>01</span> Tu mapa de oportunidades</p>
          <h1><span>Encuentra tu </span><span>próxima beca</span></h1>
          <p className="intro">Explora convocatorias y consulta cómo postular directamente con la institución que las ofrece.</p>
          <SearchForm />
          <Link className="catalog-link" href="/becas">Explorar el catálogo <ArrowIcon /></Link>
        </div>
        <figure className="hero-visual">
          <div className="image-reveal">
            <Image width={1024} height={1280} sizes="(max-width: 640px) 100vw, 45vw" preload src="/images/estudiantes-biblioteca.png" alt="Estudiantes consultando libros en una biblioteca universitaria" />
            <RouteOverlay /><figcaption>Biblioteca universitaria · América Latina</figcaption>
          </div>
          <div className="map-note" aria-hidden="true"><span>34°36′ S</span><i /><span>58°22′ O</span></div>
        </figure>
        <div className="hero-stats" aria-label="Cómo funciona">
          <div className="stat"><strong>Explora</strong><span>Encuentra convocatorias por destino y nivel.</span></div>
          <div className="stat"><strong>Compara</strong><span>Revisa cobertura, requisitos y fechas.</span></div>
          <div className="stat"><strong>Postula</strong><span>Continúa en el canal institucional verificado.</span></div>
        </div>
      </section>
      <section className="next-section" id="como-funciona">
        <p className="eyebrow"><span>02</span> Una búsqueda más clara</p>
        <h2>Del hallazgo a la postulación, sin perder el rumbo.</h2>
        <div className="demo-routes" id="recursos" aria-label="Recursos">
          <Link href="/becas?q=maestr%C3%ADa">Buscar maestrías →</Link>
          <Link href="/becas?status=OPEN">Ver convocatorias abiertas →</Link>
        </div>
      </section>
    </main><footer className="public-footer"><span>Centralizador de Becas</span><Link href="/operadores">Acceso de operadores →</Link></footer></>
  )
}
