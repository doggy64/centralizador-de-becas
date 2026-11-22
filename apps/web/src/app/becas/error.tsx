'use client';
export default function CatalogError({ reset }: { reset: () => void }) {
  return <section role="alert"><h1>No se pudo cargar la convocatoria o el catálogo</h1>
    <p>Comprueba tu conexión y vuelve a intentarlo.</p><button onClick={reset}>Reintentar</button></section>;
}
