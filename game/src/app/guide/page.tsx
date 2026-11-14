/**
 * @module app/guide/page
 * Le guide des flags. Le contenu est dans `PageGuide`, partagé avec
 * `/en/guide` ; les métadonnées et le balisage sont dans `layout.tsx`.
 */

import { PageGuide } from './PageGuide';

export default function GuidePage() {
  return <PageGuide langue="fr" />;
}
