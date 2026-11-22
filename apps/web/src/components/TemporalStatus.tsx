import type { ScholarshipDetail } from '../lib/api/scholarships';

const labels = {
  OPEN: 'Abierta', UPCOMING: 'Próxima apertura', CLOSED: 'Cerrada', TO_CONFIRM: 'Vigencia por confirmar'
} satisfies Record<ScholarshipDetail['temporalStatus'], string>;

export default function TemporalStatus({ status }: { status: ScholarshipDetail['temporalStatus'] }) {
  const styles = { OPEN: 'open', UPCOMING: 'upcoming', CLOSED: 'closed', TO_CONFIRM: 'tbc' };
  return <span className={`status status--${styles[status]}`} data-status={status}><i aria-hidden="true" />{labels[status]}</span>;
}
