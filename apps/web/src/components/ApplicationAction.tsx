import type { ScholarshipDetail } from '../lib/api/scholarships';

type Channel = ScholarshipDetail['applicationChannels'][number];

function verifiedChannel(channels: Channel[]): Channel | undefined {
  return channels.find(channel => channel.purpose === 'APPLY' && channel.verificationStatus === 'VERIFIED' && channel.urlOrEmail);
}

export default function ApplicationAction({ channels }: { channels: Channel[] }) {
  const channel = verifiedChannel(channels);
  if (!channel?.urlOrEmail) return <p className="pending-channel">Canal de postulación pendiente de verificación.</p>;

  if (channel.type === 'EMAIL') {
    return <section className="application-action" aria-labelledby="postular">
      <h2 id="postular">Postular por correo institucional</h2>
      <p><a className="apply-link" href={`mailto:${channel.urlOrEmail}`}>{channel.urlOrEmail}</a></p>
      <p>Este correo fue verificado por la fuente de la convocatoria.</p>
    </section>;
  }

  return <section className="application-action" aria-labelledby="postular">
    <h2 className="visually-hidden" id="postular">Postular</h2>
    <a className="apply-link" href={channel.urlOrEmail} target="_blank" rel="noopener noreferrer">Ir a postular en el sitio oficial</a>
    <p>Se abrirá el portal externo verificado por la fuente de la convocatoria.</p>
  </section>;
}
