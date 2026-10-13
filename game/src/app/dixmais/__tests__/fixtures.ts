import type { Fin, ProfilJuge } from '../moyenne';
import { moyenneDe, moyenneDesAutres } from '../moyenne';

export const FIN_TEST: Fin = { key: 'ca-se-tente', title: 'ÇA SE TENTE', subtitle: 'Un premier verre.', tone: 'neutral' };

/** Un profil jugé, construit à partir de ses seules notes. */
export function profilJuge(
  notes: number[],
  options: {
    nom?: string;
    numero?: number;
    ids?: string[];
    communaute?: (number | null)[];
    categories?: string[];
    /** Indices des green flags parmi les révélations. */
    verts?: number[];
    fin?: Fin;
  } = {},
): ProfilJuge {
  const nom = options.nom ?? 'Lucas';
  const propositions = notes.map((_, i) => ({
    id: options.ids?.[i] ?? `${nom}-${i}`,
    text: `Red flag numéro ${i + 1} de ${nom}`,
    type: options.verts?.includes(i) ? ('positive' as const) : ('negative' as const),
    category: options.categories?.[i] ?? 'politique',
  }));
  const communaute = options.communaute ?? notes.map(() => null);
  return {
    numero: options.numero ?? 1,
    nom,
    age: 24,
    initiale: nom.charAt(0),
    teinte: 212,
    propositions,
    notes,
    communaute,
    moyenne: moyenneDe(notes),
    moyenneCommunaute: moyenneDesAutres(communaute),
    fin: options.fin ?? FIN_TEST,
  };
}
