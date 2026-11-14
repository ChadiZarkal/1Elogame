/**
 * @module redflagtest/Presentation
 * Ce que Google — et un visiteur qui arrive par une recherche — lit du test.
 *
 * Composant serveur, rendu dans le HTML initial. Le questionnaire, lui, est
 * chargé par le navigateur après coup : sans ce bloc, le HTML de /redflagtest
 * se réduisait à « Red Flag Test — Chargement… », quatorze mots. Google
 * exécute le JavaScript, mais une page aussi vide au premier passage finit le
 * plus souvent « explorée, actuellement non indexée » — sur la page même qui
 * doit se classer pour « red flag test ».
 *
 * `Quiz` l'affiche pendant le chargement et sous l'écran de profil, puis le
 * retire dès la première question : la partie garde tout l'écran.
 *
 * Tout ce qui est dit ici est ce que le test fait réellement — voir `Recap`
 * pour le score, le profil et les trois classements.
 */

import Link from '@/components/ui/LienIntention';
import type { Langue } from '@/lib/i18n/langue';

export function Presentation({ langue = 'fr' }: { langue?: Langue } = {}) {
  if (langue === 'en') return <PresentationEn />;
  return (
    <section className="rft-presentation" aria-labelledby="rft-presentation-titre">
      <h2 id="rft-presentation-titre">Le Red Flag Test, c&apos;est quoi ?</h2>
      <p>
        Un test gratuit, en solo et anonyme, pour savoir à quel point tu es un
        red flag. Tu réponds à des situations concrètes, et chaque réponse pèse
        plus ou moins lourd selon ce qu&apos;elle révèle.
      </p>
      <p>
        À la fin, tu obtiens ton score de red flag en pourcentage, ton profil,
        et ta place parmi tous les joueurs, parmi ceux de ton sexe et parmi ceux
        de ton âge. Sans compte, sans e-mail.
      </p>
      <p>
        Ton résultat se partage par un lien : la personne qui le reçoit doit
        deviner ton score avant de le découvrir.{' '}
        <Link href="/redflagtest/stats">Les réponses de tous les joueurs</Link>{' '}
        sont publiées question par question, avec l&apos;écart entre les hommes
        et les femmes.
      </p>

      <h3>Un red flag, c&apos;est quoi exactement ?</h3>
      <p>
        Un red flag — parfois écrit « redflag » — est un signal d&apos;alarme :
        un comportement qui doit alerter sur quelqu&apos;un, dans un couple,
        une amitié ou au travail. Tout n&apos;en est pas un, et c&apos;est
        toute la question du test.{' '}
        <Link href="/guide">Définition et exemples dans le guide des flags</Link>.
      </p>

      {/* Ce qui est enregistré, vérifié dans `lib/rft/repository.ts` : score,
          sexe, tranche d'âge, durée, réponses et code de partage. Ni nom, ni
          e-mail, ni adresse IP. */}
      <h3>Le test est-il vraiment anonyme ?</h3>
      <p>
        Oui. Il ne demande ni nom, ni e-mail, ni compte : seulement ton sexe et ta
        tranche d&apos;âge, pour te comparer aux joueurs qui te ressemblent. La
        partie est enregistrée avec ces deux informations, ton score et tes
        réponses, rien d&apos;autre.
      </p>
      <h3>Qui peut voir mon résultat ?</h3>
      <p>
        Personne, sauf si tu partages son lien. Tes réponses n&apos;apparaissent
        ailleurs que mêlées à celles des autres, dans les statistiques publiées
        pour chaque question. Le détail est dans la{' '}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
    </section>
  );
}

/*
 * La version anglaise. Le guide des flags et la politique de confidentialité
 * n'existent qu'en français : leurs liens le disent.
 */
function PresentationEn() {
  return (
    <section className="rft-presentation" aria-labelledby="rft-presentation-titre">
      <h2 id="rft-presentation-titre">What is the Red Flag Test?</h2>
      <p>
        A free, solo and anonymous test to find out how much of a red flag you
        are. You answer real-life situations, and each answer weighs more or
        less depending on what it says about you.
      </p>
      <p>
        At the end, you get your red flag score as a percentage, your profile,
        and where you rank among all players, among players of your gender and
        among players your age. No account, no email.
      </p>
      <p>
        You can share your result with a link: whoever opens it has to guess
        your score before seeing it.{' '}
        <Link href="/en/redflagtest/stats">Everyone’s answers</Link>{' '}
        are published question by question, with the gap between men and
        women.
      </p>

      <h3>So what exactly is a red flag?</h3>
      <p>
        A red flag is a warning sign: a behavior that should set off alarms
        about someone, in a relationship, a friendship or at work. Not
        everything is one — and that’s the whole point of the test.{' '}
        <Link href="/guide">Definition and examples in our flag guide (in French)</Link>.
      </p>

      <h3>Is the test really anonymous?</h3>
      <p>
        Yes. It doesn’t ask for your name, your email or an account: only your
        gender and age range, to compare you with players like you. The game
        is saved with those two pieces of information, your score and your
        answers, nothing else.
      </p>
      <h3>Who can see my result?</h3>
      <p>
        Nobody, unless you share its link. Your answers only appear mixed in
        with everyone else’s, in the statistics published for each question.
        The details are in our{' '}
        <Link href="/confidentialite">privacy policy (in French)</Link>.
      </p>
    </section>
  );
}
