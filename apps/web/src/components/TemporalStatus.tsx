import type { ScholarshipDetail } from '../lib/api/scholarships';

const labels = {
  OPEN: 'Abierta', UPCOMING: 'Próxima apertura', CLOSED: 'Cerrada', TO_CONFIRM: 'Vigencia por confirmar'
} satisfies Record<ScholarshipDetail['temporalStatus'], string>;

export default function TemporalStatus({ status }: { status: ScholarshipDetail['temporalStatus'] }) {
  return <span className="status" data-status={status}>{labels[status]}</span>;
}
