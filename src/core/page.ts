/* ============================================
   BRAILLETOPÍA - ARRANQUE DE PÁGINA
   Renderiza el layout común y DESPUÉS inicializa el gestor
   de accesibilidad (así el panel ya existe en el DOM y los
   controles funcionan; antes había una condición de carrera).
   ============================================ */

import { renderLayout, type PageId } from '../components/layout';
import { AccessibilityManager } from './accessibility';

export function initPage(page: PageId): AccessibilityManager {
  renderLayout(page);
  return new AccessibilityManager();
}
