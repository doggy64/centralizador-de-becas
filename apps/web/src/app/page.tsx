import Link from 'next/link';
import SearchForm from '../components/SearchForm';

function OpportunityMap() {
  return <div className="opportunity-map" aria-hidden="true">
    <svg viewBox="0 0 520 380" role="presentation">
      <path className="map-contour" d="M40 305c70-80 82-5 144-61s31-135 115-145 117 46 183-47" />
      <path className="map-route" d="M66 263c40-18 52-5 88-29 53-35 68-95 115-107 42-10 49 26 86 13 42-14 58-62 104-83" />
      <circle className="map-stop" cx="66" cy="263" r="8" />
      <circle className="map-stop map-stop--major" cx="269" cy="127" r="11" />
      <circle className="map-stop" cx="459" cy="57" r="8" />
    </svg>
    <span className="map-note map-note--one">Tu origen</span>
    <span className="map-note map-note--two">Una nueva posibilidad</span>
    <span className="map-stamp">Mapa de<br />oportunidades</span>
  </div>;
}

export default function Home() {
  return <div className="home-page">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="hero-copy">
        <p className="hero-kicker">Oportunidades para estudiar más lejos</p>
        <h1 id="home-title">Una beca puede cambiar el mapa.</h1>
        <p className="hero-description">Encuentra convocatorias y revisa sus fechas, requisitos y vías oficiales para postular.</p>
        <SearchForm />
        <Link className="text-link" href="/becas">Explorar todas las becas</Link>
      </div>
      <OpportunityMap />
      <div className="hero-index" aria-hidden="true"><span>01</span><span>Descubrir</span></div>
    </section>
    <section className="home-guidance" aria-label="Cómo usar el catálogo">
      <p>Busca por lo que quieres estudiar, filtra por destino y compara los detalles de cada convocatoria.</p>
      <Link href="/becas">Encuentra una oportunidad <span aria-hidden="true">↗</span></Link>
    </section>
  </div>;
}
