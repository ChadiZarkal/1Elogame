/**
 * @file useSpeechRecognition.test.ts
 * @description Tests unitaires de la dictée vocale.
 * Couvre : absence de l'API (le cas de Firefox), demande d'autorisation du
 * micro, langue et options passées au moteur, remontée des segments
 * définitifs, messages d'erreur en clair, retour au repos.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from '@/lib/useSpeechRecognition';

/** Moteur de substitution : jsdom n'implémente pas `SpeechRecognition`. */
class FakeRecognition {
  static last: FakeRecognition | null = null;

  lang = '';
  interimResults = false;
  continuous = false;
  maxAlternatives = 0;
  started = false;
  aborted = false;

  onresult: ((e: unknown) => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;

  constructor() {
    FakeRecognition.last = this;
  }

  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true;
  }

  start() {
    this.started = true;
  }
  stop() {
    this.onend?.();
  }
  abort() {
    this.aborted = true;
  }

  /** Simule un segment reconnu. */
  emit(transcript: string, isFinal: boolean) {
    this.onresult?.({
      resultIndex: 0,
      results: { length: 1, 0: { isFinal, 0: { transcript } } },
    });
  }
}

type Win = typeof window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };

function installApi() {
  (window as Win).SpeechRecognition = FakeRecognition;
}
function removeApi() {
  delete (window as Win).SpeechRecognition;
  delete (window as Win).webkitSpeechRecognition;
}

/* `mediaDevices` est absent de jsdom : on le pose pour piloter l'autorisation. */
function setMediaDevices(value: unknown) {
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value });
}
function grantMicrophone() {
  setMediaDevices({ getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [] }) });
}
function blockMicrophone(name = 'NotAllowedError') {
  setMediaDevices({
    getUserMedia: vi.fn().mockRejectedValue(new DOMException('refus', name)),
  });
}

/** `start` est asynchrone : il attend la boîte d'autorisation du navigateur. */
async function startAndSettle(start: () => void | Promise<void>) {
  await act(async () => {
    await start();
  });
}

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    FakeRecognition.last = null;
    removeApi();
    setMediaDevices(undefined);
  });
  afterEach(() => {
    removeApi();
  });

  it("se declare indisponible quand le navigateur n'a pas l'API", () => {
    // Le cas de Firefox : l'appelant doit pouvoir masquer le bouton plutôt que
    // d'exposer un contrôle qui échoue.
    const { result } = renderHook(() => useSpeechRecognition(vi.fn()));
    expect(result.current.supported).toBe(false);
  });

  it("ne tente rien quand l'API est absente", async () => {
    const onResult = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition(onResult));
    await startAndSettle(result.current.start);
    expect(result.current.listening).toBe(false);
    expect(onResult).not.toHaveBeenCalled();
  });

  it("demande l'autorisation du micro avant de demarrer", async () => {
    installApi();
    grantMicrophone();
    const { result } = renderHook(() => useSpeechRecognition(vi.fn()));

    await startAndSettle(result.current.start);

    // Sans cette demande explicite, la reconnaissance échouait sur
    // « not-allowed » sans qu'aucune boîte n'ait été présentée.
    const media = navigator.mediaDevices as unknown as { getUserMedia: ReturnType<typeof vi.fn> };
    expect(media.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(result.current.listening).toBe(true);
  });

  it('ne demarre pas et explique quand le micro est bloque', async () => {
    installApi();
    blockMicrophone();
    const onError = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition(vi.fn(), onError));

    await startAndSettle(result.current.start);

    expect(result.current.listening).toBe(false);
    expect(FakeRecognition.last).toBeNull();
    const message = onError.mock.calls[0][0] as string;
    // Le message doit dire quoi faire, pas seulement que ça a échoué.
    expect(message).toMatch(/adresse/i);
  });

  it('signale un appareil sans micro', async () => {
    installApi();
    blockMicrophone('NotFoundError');
    const onError = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition(vi.fn(), onError));

    await startAndSettle(result.current.start);

    expect(onError.mock.calls[0][0]).toMatch(/aucun micro/i);
  });

  it('demarre en francais avec les resultats intermediaires', async () => {
    installApi();
    grantMicrophone();
    const { result } = renderHook(() => useSpeechRecognition(vi.fn()));
    expect(result.current.supported).toBe(true);

    await startAndSettle(result.current.start);

    const engine = FakeRecognition.last!;
    expect(engine.started).toBe(true);
    expect(engine.lang).toBe('fr-FR');
    expect(engine.interimResults).toBe(true);
  });

  it('ne remonte que les segments definitifs, les provisoires restant en apercu', async () => {
    installApi();
    grantMicrophone();
    const onResult = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition(onResult));
    await startAndSettle(result.current.start);

    act(() => FakeRecognition.last!.emit('il regarde mon', false));
    expect(onResult).not.toHaveBeenCalled();
    expect(result.current.interim).toBe('il regarde mon');

    act(() => FakeRecognition.last!.emit('Il regarde mon téléphone.', true));
    expect(onResult).toHaveBeenCalledWith('Il regarde mon téléphone.');
  });

  it('traduit les codes d erreur du moteur en messages lisibles', async () => {
    installApi();
    grantMicrophone();
    const onError = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition(vi.fn(), onError));
    await startAndSettle(result.current.start);

    act(() => FakeRecognition.last!.onerror!({ error: 'no-speech' }));

    const message = onError.mock.calls[0][0] as string;
    expect(message).toMatch(/entendu/i);
    // Le code brut n'aide personne.
    expect(message).not.toContain('no-speech');
  });

  it('reste muet sur une interruption volontaire', async () => {
    installApi();
    grantMicrophone();
    const onError = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition(vi.fn(), onError));
    await startAndSettle(result.current.start);

    act(() => FakeRecognition.last!.onerror!({ error: 'aborted' }));

    expect(onError).not.toHaveBeenCalled();
  });

  it('revient au repos en fin de reconnaissance', async () => {
    installApi();
    grantMicrophone();
    const { result } = renderHook(() => useSpeechRecognition(vi.fn()));
    await startAndSettle(result.current.start);
    act(() => FakeRecognition.last!.emit('en cours', false));
    expect(result.current.listening).toBe(true);

    act(() => result.current.stop());

    expect(result.current.listening).toBe(false);
    expect(result.current.interim).toBe('');
  });

  it('abandonne la reconnaissance au demontage', async () => {
    installApi();
    grantMicrophone();
    const { result, unmount } = renderHook(() => useSpeechRecognition(vi.fn()));
    await startAndSettle(result.current.start);
    const engine = FakeRecognition.last!;

    unmount();

    // `abort` et non `stop` : on ne veut pas d'un dernier résultat livré à un
    // composant démonté.
    expect(engine.aborted).toBe(true);
  });
});
