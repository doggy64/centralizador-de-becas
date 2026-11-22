'use client';

import dynamic from 'next/dynamic';
const EditorialConsole = dynamic(() => import('./EditorialConsole'), {
  ssr: false, loading: () => <p role="status">Cargando el prototipo editorial…</p>,
});

export default function EditorialDemo({ section }: { section: string }) {
  return <EditorialConsole section={section} />;
}
