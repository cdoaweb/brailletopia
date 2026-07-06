/* ============================================
   BRAILLETOPÍA - PÁGINA DE JUEGOS
   Selección de juegos: adivina la letra (3 niveles),
   celda braille interactiva y teclado Perkins.
   ============================================ */

import { initPage } from '../core/page';
import { renderBreadcrumbs } from '../components/layout';
import { GuessTheLetterGame, type GameLevel } from '../games/guess-letter';
import { BrailleCell } from '../components/braille-cell';
import { PerkinsKeyboard } from '../components/perkins';

const manager = initPage('juegos');
renderBreadcrumbs([
  { text: 'Inicio', url: '../index.html' },
  { text: 'Juegos' },
]);

const gameArea = document.getElementById('game-area') as HTMLElement;
const gameContainer = document.getElementById('active-game-container') as HTMLElement;

let activePerkins: PerkinsKeyboard | null = null;
let activeCell: BrailleCell | null = null;

function closeGame(): void {
  activePerkins?.destroy();
  activePerkins = null;
  activeCell = null;
  gameContainer.innerHTML = '';
  gameArea.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openGameArea(): void {
  closeGame();
  gameArea.style.display = 'block';
  gameArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showGuessGame(level: GameLevel): void {
  openGameArea();
  new GuessTheLetterGame(gameContainer, { level });
}

function showBrailleCell(): void {
  openGameArea();
  gameContainer.innerHTML = `
    <div style="max-width: 600px; margin: 0 auto;">
      <h2 style="text-align: center; margin-bottom: var(--space-lg);">Celda Braille Interactiva</h2>
      <p style="text-align: center; margin-bottom: var(--space-xl);">
        Haz clic en los puntos para activarlos o desactivarlos.
        El sistema identificará automáticamente la letra.
      </p>
      <div id="braille-demo"></div>
      <div style="text-align: center; margin-top: var(--space-xl);">
        <button class="btn btn-secondary" id="braille-reset">🔄 Reiniciar</button>
      </div>
    </div>
  `;
  const demoContainer = document.getElementById('braille-demo')!;
  activeCell = new BrailleCell(demoContainer, {
    size: 'large',
    interactive: true,
    showNumbers: true,
  });
  document.getElementById('braille-reset')?.addEventListener('click', () => activeCell?.reset());
}

function showPerkins(): void {
  openGameArea();
  gameContainer.innerHTML = `
    <div style="max-width: 700px; margin: 0 auto;">
      <h2 style="text-align: center; margin-bottom: var(--space-lg);">Teclado Perkins Virtual</h2>
      <div id="perkins-demo"></div>
    </div>
  `;
  activePerkins = new PerkinsKeyboard(document.getElementById('perkins-demo')!);
}

document.querySelectorAll<HTMLButtonElement>('[data-game]').forEach((btn) => {
  btn.addEventListener('click', () => {
    switch (btn.dataset.game) {
      case 'guess-letter': {
        const levelSelect = document.getElementById('guess-level') as HTMLSelectElement | null;
        showGuessGame((levelSelect?.value as GameLevel) ?? 'easy');
        break;
      }
      case 'braille-cell':
        showBrailleCell();
        break;
      case 'perkins':
        showPerkins();
        break;
    }
  });
});

document.getElementById('close-game')?.addEventListener('click', closeGame);

manager.announce('Página de juegos. Elige un juego para empezar a practicar braille.');
