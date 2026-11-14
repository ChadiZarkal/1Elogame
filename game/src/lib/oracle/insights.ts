/**
 * @module lib/oracle/insights
 * Les constats de la page de statistiques de l'Oracle, en anglais.
 *
 * Les constats français sont rédigés par `getGenderStats`
 * (`lib/repositories/community`) ; ceux-ci suivent exactement les mêmes règles
 * et les mêmes seuils, à partir des mêmes chiffres. On les recalcule plutôt que
 * de traduire les phrases françaises : les nombres y sont noyés dans le texte.
 */

export interface StatGenre {
  gender: string;
  total: number;
  red: number;
  green: number;
  redPercent: number;
}

export function insightsAnglais(byGender: StatGenre[]): string[] {
  const insights: string[] = [];
  const homme = byGender.find((g) => g.gender === 'homme');
  const femme = byGender.find((g) => g.gender === 'femme');

  if (homme && femme && homme.total >= 3 && femme.total >= 3) {
    if (homme.redPercent > femme.redPercent) {
      insights.push(`🚩 Men get ${homme.redPercent - femme.redPercent}% more Red Flags than women`);
    } else if (femme.redPercent > homme.redPercent) {
      insights.push(`🚩 Women get ${femme.redPercent - homme.redPercent}% more Red Flags than men`);
    } else {
      insights.push('⚖️ Men and women get exactly as many Red Flags');
    }

    if (homme.total > femme.total) {
      const ratio = Math.round((homme.total / femme.total) * 10) / 10;
      insights.push(`♂️ Men use the Oracle ${ratio}x more than women`);
    } else if (femme.total > homme.total) {
      const ratio = Math.round((femme.total / homme.total) * 10) / 10;
      insights.push(`♀️ Women use the Oracle ${ratio}x more than men`);
    }

    const hommeGreenPct = homme.total > 0 ? Math.round((homme.green / homme.total) * 100) : 0;
    const femmeGreenPct = femme.total > 0 ? Math.round((femme.green / femme.total) * 100) : 0;
    if (hommeGreenPct > femmeGreenPct + 5) {
      insights.push(`🟢 Men get ${hommeGreenPct}% Green Flags vs ${femmeGreenPct}% for women`);
    } else if (femmeGreenPct > hommeGreenPct + 5) {
      insights.push(`🟢 Women get ${femmeGreenPct}% Green Flags vs ${hommeGreenPct}% for men`);
    }
  }

  if (insights.length === 0) {
    insights.push('📊 Not enough data for insights yet (we need at least 3 answers per gender)');
  }

  return insights;
}
