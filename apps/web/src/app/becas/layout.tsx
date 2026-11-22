import Header from '../../components/Header';
import type { ReactNode } from 'react';

export default function CatalogLayout({ children }: { children: ReactNode }) {
  return <><Header /><main id="contenido" tabIndex={-1}>{children}</main></>;
}
