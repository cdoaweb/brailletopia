/* ============================================
   BRAILLETOPÍA - CELDA BRAILLE INTERACTIVA
   ============================================ */

import { getLetterForPattern, getPatternForLetter } from '../data/braille';
import { announce } from '../core/announcer';
import { playSound } from '../core/audio';

export interface BrailleCellOptions {
  size?: 'normal' | 'large';
  interactive?: boolean;
  showNumbers?: boolean;
  onChange?: (dots: boolean[], letter: string) => void;
}

export class BrailleCell {
  private container: HTMLElement;
  private options: Required<Omit<BrailleCellOptions, 'onChange'>> & Pick<BrailleCellOptions, 'onChange'>;
  private dots: boolean[] = [false, false, false, false, false, false];
  private currentLetter = '';

  constructor(container: HTMLElement, options: BrailleCellOptions = {}) {
    this.container = container;
    this.options = {
      size: options.size ?? 'normal',
      interactive: options.interactive ?? true,
      showNumbers: options.showNumbers ?? true,
      onChange: options.onChange,
    };
    this.render();
  }

  private render(): void {
    const large = this.options.size === 'large';
    const cellClass = large ? 'braille-cell large' : 'braille-cell';
    const dotClass = large ? 'braille-dot large' : 'braille-dot';

    this.container.innerHTML = `
      <div class="braille-cell-container">
        <div class="braille-letter" aria-live="polite" style="${this.currentLetter ? '' : 'visibility: hidden;'}">
          ${this.currentLetter || '·'}
        </div>
        <div class="${cellClass}" role="group" aria-label="Celda braille de 6 puntos">
          ${this.dots
            .map(
              (active, index) => `
            <button
              class="${dotClass}${active ? ' active' : ''}"
              data-dot="${index + 1}"
              aria-label="Punto ${index + 1}"
              aria-pressed="${active}"
              ${this.options.interactive ? '' : 'disabled'}
            >
              ${this.options.showNumbers ? index + 1 : ''}
            </button>`,
            )
            .join('')}
        </div>
      </div>
    `;

    if (this.options.interactive) {
      this.container.querySelectorAll<HTMLButtonElement>('.braille-dot').forEach((button, index) => {
        button.addEventListener('click', () => this.toggleDot(index));
      });
    }
  }

  private toggleDot(index: number): void {
    this.dots[index] = !this.dots[index];
    playSound(this.dots[index] ? 'dot-on' : 'dot-off');
    this.identifyLetter();
    this.render();

    const state = this.dots[index] ? 'activado' : 'desactivado';
    const letterInfo = this.currentLetter ? `. Letra identificada: ${this.currentLetter}` : '';
    announce(`Punto ${index + 1} ${state}${letterInfo}`);

    // Recuperar el foco en el punto pulsado tras re-renderizar
    this.container.querySelector<HTMLButtonElement>(`[data-dot="${index + 1}"]`)?.focus();

    this.options.onChange?.([...this.dots], this.currentLetter);
  }

  private identifyLetter(): void {
    this.currentLetter = getLetterForPattern(this.dots) ?? '';
  }

  setLetter(letter: string): void {
    const pattern = getPatternForLetter(letter);
    if (!pattern) return;
    this.dots = [...pattern];
    this.currentLetter = letter.toUpperCase();
    this.render();
  }

  reset(): void {
    this.dots = [false, false, false, false, false, false];
    this.currentLetter = '';
    this.render();
    announce('Celda braille reiniciada');
  }
}
