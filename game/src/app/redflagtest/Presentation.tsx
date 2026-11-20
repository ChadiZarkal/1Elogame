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
 * La version anglaise, réécrite le 2026-11-20 pour les recherches anglaises
 * (« am I a red flag », « red flag quiz ») : plus de questions-réponses, et
 * les liens vers le guide et la confidentialité, traduits depuis, vont à leur
 * version anglaise. Les questions-réponses sont aussi déclarées en `FAQPage`
 * (`FAQ_RFT_EN`, voir `PageTest`) : le balisage doit dire exactement ce que la
 * page affiche, d'où une seule source pour les deux.
 */
export const FAQ_RFT_EN: Array<{ question: string; reponse: string }> = [
  {
    question: 'Am I a red flag?',
    reponse:
      'That’s what the test is for. Instead of asking you to judge yourself, it asks blunt questions about real life — have you ever gone through a partner’s phone? does one of your exes hate you? — and scores your answers.',
  },
  {
    question: 'How is my red flag score calculated?',
    reponse:
      'Each answer adds percentage points to your score, more or less depending on what it reveals; an answer can even take points away. Your score is the sum. The test then breaks it down by theme, such as control, loyalty or anger and excess, to show where your points come from.',
  },
  {
    question: 'What’s the difference between a red flag and a green flag?',
    reponse:
      'A red flag is a warning sign: a behavior that should set off alarms about someone, in a relationship, a friendship or at work. A green flag is the opposite: a sign that someone is safe, respectful and worth keeping around.',
  },
  {
    question: 'Is the test really anonymous?',
    reponse:
      'Yes. It doesn’t ask for your name, your email or an account: only your gender and age range, to compare you with players like you. The game is saved with those two pieces of information, your score and your answers, nothing else.',
  },
  {
    question: 'Who can see my result?',
    reponse:
      'Nobody, unless you share its link. Your answers only appear mixed in with everyone else’s, in the statistics published for each question.',
  },
];

function PresentationEn() {
  const [suis, calcul, difference, anonyme, visible] = FAQ_RFT_EN;
  return (
    <section className="rft-presentation" aria-labelledby="rft-presentation-titre">
      <h2 id="rft-presentation-titre">What is the Red Flag Test?</h2>
      <p>
        A free, solo and anonymous red flag quiz to find out how much of a red
        flag you are. You answer real-life situations, and each answer weighs
        more or less depending on what it says about you.
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

      <h3>{suis.question}</h3>
      <p>{suis.reponse}</p>

      <h3>{calcul.question}</h3>
      <p>{calcul.reponse}</p>

      <h3>{difference.question}</h3>
      <p>
        {difference.reponse}{' '}
        <Link href="/en/guide">Definition and examples in our red flag guide</Link>.
      </p>

      <h3>{anonyme.question}</h3>
      <p>{anonyme.reponse}</p>

      <h3>{visible.question}</h3>
      <p>
        {visible.reponse} The details are in our{' '}
        <Link href="/en/confidentialite">privacy policy</Link>.
      </p>
    </section>
  );
}
