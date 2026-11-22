import { notFound } from 'next/navigation';
import EditorialDemo from '../../../../components/operators/EditorialDemo';

export default async function EditorialPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!['fuentes', 'ingesta', 'revision'].includes(section)) notFound();
  return <EditorialDemo section={section} />;
}
