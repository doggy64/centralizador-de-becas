import Link from 'next/link';
import type { SearchParams } from '../lib/api/scholarships';

type PaginationProps = {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  filters: SearchParams;
};

function pageHref(filters: SearchParams, page: number): string {
  const query = new URLSearchParams();
  for (const [key, raw] of Object.entries(filters)) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (key !== 'page' && value?.trim()) query.set(key, value.trim());
  }
  query.set('page', String(page));
  return `/becas?${query.toString()}`;
}

export default function Pagination({ page, totalPages, hasNextPage, filters }: PaginationProps) {
  if (totalPages <= 1) return null;

  return <nav className="pagination" aria-label="Paginación">
    {page > 1 ? <Link href={pageHref(filters, page - 1)}>Anterior</Link> : <span aria-disabled="true">Anterior</span>}
    <span>Página {page} de {totalPages}</span>
    {hasNextPage ? <Link href={pageHref(filters, page + 1)}>Siguiente</Link> : <span aria-disabled="true">Siguiente</span>}
  </nav>;
}
