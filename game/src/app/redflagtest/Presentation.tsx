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

import Link from 'next/link';

export function Presentation() {
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
    </section>
  );
}
