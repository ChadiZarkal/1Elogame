/**
 * @file useSpeechRecognition.test.ts
 * @description Tests unitaires de la dictée vocale.
 * Couvre : absence de l'API (le cas de Firefox), langue et options passées au
 * moteur, remontée des segments définitifs, messages d'erreur en clair, et
 * retour au repos en fin de reconnaissance.
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
  stopped = false;
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
    this.stopped = true;
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

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    FakeRecognition.last = null;
    removeApi();
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

  it("ne tente rien quand l'API est absente", () => {
    const onResult = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition(onResult));
    act(() => result.current.start());
    expect(result.current.listening).toBe(false);
    expect(onResult).not.toHaveBeenCalled();
  });

  it('se declare disponible et demarre en francais', () => {
    installApi();
    const { result } = renderHook(() => useSpeechRecognition(vi.fn()));
    expect(result.current.supported).toBe(true);

    act(() => result.current.start());

    const engine = FakeRecognition.last!;
    expect(engine.started).toBe(true);
    expect(engine.lang).toBe('fr-FR');
    // Les résultats intermédiaires alimentent le retour d'écoute.
    expect(engine.interimResults).toBe(true);
    expect(result.current.listening).toBe(true);
  });

  it('ne remonte que les segments definitifs, les provisoires restant en apercu', () => {
    installApi();
    const onResult = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition(onResult));
    act(() => result.current.start());

    act(() => FakeRecognition.last!.emit('il regarde mon', false));
    expect(onResult).not.toHaveBeenCalled();
    expect(result.current.interim).toBe('il regarde mon');

    act(() => FakeRecognition.last!.emit('Il regarde mon téléphone.', true));
    expect(onResult).toHaveBeenCalledWith('Il regarde mon téléphone.');
  });

  it('traduit les codes d erreur en messages lisibles', () => {
    installApi();
    const onError = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition(vi.fn(), onError));
    act(() => result.current.start());

    act(() => FakeRecognition.last!.onerror!({ error: 'not-allowed' }));

    expect(onError).toHaveBeenCalledTimes(1);
    const message = onError.mock.calls[0][0] as string;
    expect(message).toMatch(/micro/i);
    // Le code brut n'aide personne.
    expect(message).not.toContain('not-allowed');
  });

  it('reste muet sur une interruption volontaire', () => {
    installApi();
    const onError = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition(vi.fn(), onError));
    act(() => result.current.start());

    act(() => FakeRecognition.last!.onerror!({ error: 'aborted' }));

    expect(onError).not.toHaveBeenCalled();
  });

  it('revient au repos en fin de reconnaissance', () => {
    installApi();
    const { result } = renderHook(() => useSpeechRecognition(vi.fn()));
    act(() => result.current.start());
    act(() => FakeRecognition.last!.emit('en cours', false));
    expect(result.current.listening).toBe(true);

    act(() => result.current.stop());

    expect(result.current.listening).toBe(false);
    expect(result.current.interim).toBe('');
  });

  it('abandonne la reconnaissance au demontage', () => {
    installApi();
    const { result, unmount } = renderHook(() => useSpeechRecognition(vi.fn()));
    act(() => result.current.start());
    const engine = FakeRecognition.last!;

    unmount();

    // `abort` et non `stop` : on ne veut pas d'un dernier résultat livré à un
    // composant démonté.
    expect(engine.aborted).toBe(true);
  });
});
