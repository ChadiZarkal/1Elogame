import Link from '@/components/ui/LienIntention';

/**
 * L'avertissement en tête des pages légales anglaises : la traduction est
 * donnée pour information, seule la version française fait foi. Le lien mène
 * à la page française correspondante.
 */
export function AvisVersionFrancaise({ cheminFrancais }: { cheminFrancais: string }) {
  return (
    <aside
      role="note"
      className="legal-page__section"
      style={{
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 12,
        padding: '12px 16px',
      }}
    >
      <p style={{ margin: 0 }}>
        This page is an English translation provided for convenience. Only the{' '}
        <Link href={cheminFrancais} hrefLang="fr">French version</Link> is legally binding: in
        the event of any difference between the two, the French version prevails.
      </p>
    </aside>
  );
}
