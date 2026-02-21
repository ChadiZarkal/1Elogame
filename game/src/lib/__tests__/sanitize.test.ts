import { describe, it, expect } from 'vitest';
import { sanitizeText } from '@/lib/sanitize';

describe('sanitizeText', () => {
  it('retourne le texte tel quel si propre', () => {
    expect(sanitizeText('Bonjour le monde')).toBe('Bonjour le monde');
  });

  it('supprime les balises HTML', () => {
    expect(sanitizeText('<script>alert("xss")</script>Bonjour')).toBe('alert("xss")Bonjour');
  });

  it('supprime les balises HTML imbriquées', () => {
    expect(sanitizeText('<div><p>test</p></div>')).toBe('test');
  });

  it('supprime javascript: protocol', () => {
    expect(sanitizeText('javascript:alert(1)')).toBe('alert(1)');
  });

  it('supprime les event handlers', () => {
    expect(sanitizeText('onclick=alert(1) test')).toBe('alert(1) test');
  });

  it('supprime les caractères de contrôle', () => {
    expect(sanitizeText('hello\x00\x01\x02world')).toBe('helloworld');
  });

  it('conserve les newlines converties en espaces', () => {
    expect(sanitizeText('line1\nline2\nline3')).toBe('line1 line2 line3');
  });

  it('normalise les espaces multiples', () => {
    expect(sanitizeText('hello   world   test')).toBe('hello world test');
  });

  it('trim le texte', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('respecte la limite de longueur', () => {
    const long = 'a'.repeat(1000);
    expect(sanitizeText(long, 100).length).toBe(100);
  });

  it('utilise la longueur par défaut de 500', () => {
    const long = 'a'.repeat(1000);
    expect(sanitizeText(long).length).toBe(500);
  });

  it('retourne une chaîne vide pour null/undefined', () => {
    expect(sanitizeText(null as unknown as string)).toBe('');
    expect(sanitizeText(undefined as unknown as string)).toBe('');
    expect(sanitizeText('')).toBe('');
  });

  it('conserve les caractères français accentués', () => {
    expect(sanitizeText('éàüöî ç ñ')).toBe('éàüöî ç ñ');
  });

  it('conserve les emojis', () => {
    expect(sanitizeText('🔥 Red Flag 🚩')).toBe('🔥 Red Flag 🚩');
  });

  it('gère une attaque XSS complexe', () => {
    const xss = '<img src=x onerror=alert(1)><script>document.cookie</script>';
    const result = sanitizeText(xss);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('<img');
    expect(result).not.toContain('onerror');
  });
});


