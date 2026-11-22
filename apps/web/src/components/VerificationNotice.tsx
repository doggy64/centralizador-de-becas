import type { ScholarshipDetail } from '../lib/api/scholarships';

export default function VerificationNotice({ scholarship }: { scholarship: ScholarshipDetail }) {
  const pending = [
    !scholarship.dates.deadline && !scholarship.dates.originalDeadlineText ? 'la fecha límite' : null,
    !scholarship.lastVerifiedAt ? 'la última revisión' : null,
    !scholarship.institution.websiteUrl ? 'el sitio institucional' : null,
  ].filter((item): item is string => item !== null);
  if (!pending.length) return null;

  return <aside className="verification-notice" aria-label="Información pendiente de verificación">
    <strong>Información pendiente de verificación</strong>
    <p>Falta confirmar {pending.join(', ')}.</p>
  </aside>;
}
