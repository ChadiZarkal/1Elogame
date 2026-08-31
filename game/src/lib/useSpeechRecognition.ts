'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

/**
 * Dictée vocale, adossée à la reconnaissance du navigateur.
 *
 * `SpeechRecognition` est une fonction du navigateur, pas un service qu'on
 * consomme : gratuite quel que soit le trafic, sans clé, sans route serveur.
 * C'est ce qui a décidé du choix — un palier gratuit hébergé s'épuise, et il
 * s'épuise pour tous les visiteurs à la fois.
 *
 * Ce qu'elle n'est pas : universelle. Firefox ne l'implémente pas, ni sur
 * bureau ni sur Android. `supported` sert à masquer le bouton là-bas plutôt
 * qu'à laisser un contrôle qui échoue.
 *
 * À savoir : dans Chrome, l'audio est envoyé aux serveurs de Google pour être
 * reconnu — ce n'est pas notre serveur, mais c'est une transmission, et la page
 * de confidentialité le dit.
 *
 * `continuous` reste à sa valeur par défaut (une seule prise de parole, puis
 * arrêt automatique). Le mode continu est nettement moins fiable sur iOS, et
 * l'Oracle n'attend que 280 caractères : une phrase suffit, et l'on peut
 * reprendre la parole autant de fois qu'on veut, le texte s'ajoutant à la suite.
 */

/** Le minimum de la spécification, pas encore dans les types du DOM. */
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void | Promise<void>;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

/** La capacité du navigateur ne change jamais : rien à quoi s'abonner. */
const subscribeToSupport = () => () => {};
const getSupportSnapshot = () => getConstructor() !== null;
/** Côté serveur, on ne sait rien : le bouton n'est pas rendu. */
const getSupportServerSnapshot = () => false;

function getConstructor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Marche à suivre quand le micro est bloqué au niveau du navigateur.
 *
 * Dans ce cas, aucune demande ne peut plus être présentée : le navigateur a
 * mémorisé le refus et `getUserMedia` échoue sans rien afficher. La seule
 * issue est le panneau des autorisations du site, qu'il faut donc décrire.
 */
const BLOCKED =
  'Le micro est bloqué pour ce site. Touche l’icône à gauche de l’adresse, ' +
  'autorise le micro, puis réessaie.';

/** Messages en clair : « not-allowed » n'aide personne. */
const MESSAGES: Record<string, string> = {
  'not-allowed': BLOCKED,
  'service-not-allowed': BLOCKED,
  'no-speech': "Je n'ai rien entendu. Réessaie en parlant un peu plus près.",
  'audio-capture': 'Aucun micro détecté sur cet appareil.',
  network: 'La reconnaissance vocale a besoin du réseau, et il manque à l’appel.',
  aborted: '',
};

/**
 * Demande l'accès au micro, ce qui présente la boîte d'autorisation du
 * navigateur.
 *
 * Sans cette étape, `SpeechRecognition.start()` échouait sur `not-allowed`
 * sans que rien n'ait été demandé : la reconnaissance ne présente pas de
 * demande d'elle-même quand aucune autorisation n'est encore accordée. Le
 * flux audio obtenu est refermé aussitôt — la reconnaissance ouvre le sien,
 * on ne voulait que la boîte de dialogue.
 */
async function requestMicrophone(): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!navigator.mediaDevices?.getUserMedia) {
    /* Navigateur sans `mediaDevices` : on laisse la reconnaissance tenter sa
       chance plutôt que de refuser sur une supposition. */
    return { ok: true };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return { ok: true };
  } catch (error) {
    const name = error instanceof DOMException ? error.name : '';
    if (name === 'NotFoundError' || name === 'OverconstrainedError') {
      return { ok: false, message: 'Aucun micro détecté sur cet appareil.' };
    }
    if (name === 'NotReadableError') {
      return {
        ok: false,
        message: 'Le micro est déjà utilisé par une autre application.',
      };
    }
    // `NotAllowedError`, et tout le reste : le refus est le cas courant.
    return { ok: false, message: BLOCKED };
  }
}

export interface UseSpeechRecognition {
  /** Le navigateur sait-il faire ? Sinon, ne montre pas le bouton. */
  supported: boolean;
  listening: boolean;
  /** Vrai tant que la boîte d'autorisation du navigateur est à l'écran. */
  preparing: boolean;
  /** Texte en cours de reconnaissance, encore susceptible de changer. */
  interim: string;
  start: () => void;
  stop: () => void;
}

/**
 * @param onResult reçoit chaque segment reconnu comme définitif. Appelé une
 *   fois par segment, à charge de l'appelant de l'ajouter à sa saisie.
 * @param onError message déjà rédigé pour l'utilisateur, ou chaîne vide quand
 *   il n'y a rien à dire (interruption volontaire).
 */
export function useSpeechRecognition(
  onResult: (text: string) => void,
  onError?: (message: string) => void,
): UseSpeechRecognition {
  const supported = useSyncExternalStore(
    subscribeToSupport,
    getSupportSnapshot,
    getSupportServerSnapshot,
  );
  const [listening, setListening] = useState(false);
  /** Le temps que la boîte d'autorisation soit à l'écran. */
  const [preparing, setPreparing] = useState(false);
  const [interim, setInterim] = useState('');

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => {
      /* `abort` et non `stop` : au démontage on ne veut pas d'un dernier
         résultat livré à un composant qui n'existe plus. */
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(async () => {
    if (recognitionRef.current) return; // déjà à l'écoute

    const Ctor = getConstructor();
    if (!Ctor) return;

    setPreparing(true);
    const permission = await requestMicrophone();
    setPreparing(false);
    if (!permission.ok) {
      onError?.(permission.message);
      return;
    }
    /* Un second appui a pu démarrer l'écoute pendant l'attente. */
    if (recognitionRef.current) return;

    const recognition = new Ctor();
    recognition.lang = 'fr-FR';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let pending = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          onResult(text);
        } else {
          pending += text;
        }
      }
      setInterim(pending);
    };

    recognition.onerror = (event) => {
      const message = MESSAGES[event.error] ?? "La reconnaissance vocale n'a pas abouti.";
      if (message) onError?.(message);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      setInterim('');
    };

    try {
      recognition.start();
    } catch {
      /* `start()` sur une instance déjà démarrée lève : on n'en fait rien. */
      return;
    }
    recognitionRef.current = recognition;
    setListening(true);
  }, [onResult, onError]);

  return { supported, listening, preparing, interim, start, stop };
}
