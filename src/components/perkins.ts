/* ============================================
   BRAILLETOPÍA - TECLADO PERKINS VIRTUAL
   Escritura braille con acordes: mantén pulsadas varias
   teclas (F, D, S, J, K, L) y suéltalas para escribir la letra,
   igual que en una máquina Perkins real.
   ============================================ */

import { getLetterForPattern } from '../data/braille';
import { announce } from '../core/announcer';
import { playSound } from '../core/audio';

export interface PerkinsOptions {
  showOutput?: boolean;
  onInput?: (text: string) => void;
}

const KEY_MAP: Record<string, number> = { f: 1, d: 2, s: 3, j: 4, k: 5, l: 6 };

export class PerkinsKeyboard {
  private container: HTMLElement;
  private options: PerkinsOptions;
  private chordDots = new Set<number>();
  private heldKeys = new Set<string>();
  private output = '';
  private keydownHandler: (e: KeyboardEvent) => void;
  private keyupHandler: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement, options: PerkinsOptions = {}) {
    this.container = container;
    this.options = { showOutput: true, ...options };

    this.keydownHandler = (e) => this.onPhysicalKeyDown(e);
    this.keyupHandler = (e) => this.onPhysicalKeyUp(e);

    this.render();
    this.setupPointerInput();
    document.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('keyup', this.keyupHandler);
  }

  /** Desconecta los listeners globales al cerrar el juego. */
  destroy(): void {
    document.removeEventListener('keydown', this.keydownHandler);
    document.removeEventListener('keyup', this.keyupHandler);
  }

  private render(): void {
    this.container.innerHTML = `
      <div>
        ${
          this.options.showOutput
            ? `
          <div class="perkins-output" role="textbox" aria-label="Salida del teclado Perkins" aria-live="polite" aria-readonly="true">
            Presiona las teclas para escribir en braille
          </div>`
            : ''
        }

        <div class="perkins-keyboard" role="group" aria-label="Teclado Perkins de 6 teclas">
          ${[3, 2, 1, 4, 5, 6]
            .map(
              (dot) => `
            <button class="perkins-key" data-dot="${dot}" aria-label="Tecla punto ${dot}" aria-pressed="false">
              <span class="perkins-key-number">${dot}</span>
              <span class="perkins-key-label">●</span>
            </button>`,
            )
            .join('')}
          <button class="perkins-key perkins-space" data-action="space" aria-label="Escribir letra o espacio">
            ESCRIBIR / ESPACIO
          </button>
          <button class="perkins-key perkins-backspace" data-action="backspace" aria-label="Borrar último carácter">
            ← BORRAR
          </button>
        </div>

        <div style="margin-top: var(--space-md); text-align: center; color: var(--color-gray-700);">
          <p><strong>Con teclado físico:</strong> mantén pulsadas F, D, S (puntos 1, 2, 3) y J, K, L (puntos 4, 5, 6) a la vez y suéltalas para escribir la letra. Espacio añade un espacio.</p>
          <p><strong>Con ratón:</strong> marca los puntos y pulsa "ESCRIBIR / ESPACIO".</p>
        </div>
      </div>
    `;
  }

  private setupPointerInput(): void {
    this.container.querySelectorAll<HTMLButtonElement>('.perkins-key[data-dot]').forEach((key) => {
      key.addEventListener('click', () => {
        const dot = Number(key.dataset.dot);
        if (this.chordDots.has(dot)) {
          this.chordDots.delete(dot);
        } else {
          this.chordDots.add(dot);
          playSound('key');
        }
        key.classList.toggle('pressed', this.chordDots.has(dot));
        key.setAttribute('aria-pressed', String(this.chordDots.has(dot)));
      });
    });

    this.container
      .querySelector<HTMLButtonElement>('[data-action="space"]')
      ?.addEventListener('click', () => this.commitChord());

    this.container
      .querySelector<HTMLButtonElement>('[data-action="backspace"]')
      ?.addEventListener('click', () => this.backspace());
  }

  private onPhysicalKeyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();

    if (key in KEY_MAP) {
      e.preventDefault();
      if (!this.heldKeys.has(key)) {
        this.heldKeys.add(key);
        const dot = KEY_MAP[key];
        this.chordDots.add(dot);
        this.setKeyVisual(dot, true);
        playSound('key');
      }
    } else if (e.key === ' ') {
      e.preventDefault();
      this.output += ' ';
      this.updateOutput();
      announce('Espacio añadido');
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      this.backspace();
    }
  }

  private onPhysicalKeyUp(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    if (!(key in KEY_MAP)) return;
    e.preventDefault();
    this.heldKeys.delete(key);
    // Cuando se suelta la última tecla del acorde, se escribe la letra
    if (this.heldKeys.size === 0 && this.chordDots.size > 0) {
      this.commitChord();
    }
  }

  private setKeyVisual(dot: number, pressed: boolean): void {
    const button = this.container.querySelector<HTMLButtonElement>(`[data-dot="${dot}"]`);
    button?.classList.toggle('pressed', pressed);
    button?.setAttribute('aria-pressed', String(pressed));
  }

  private commitChord(): void {
    if (this.chordDots.size === 0) {
      this.output += ' ';
      this.updateOutput();
      announce('Espacio añadido');
      return;
    }

    const pattern = Array.from({ length: 6 }, (_, i) => this.chordDots.has(i + 1));
    const letter = getLetterForPattern(pattern);

    if (letter) {
      this.output += letter;
      this.updateOutput();
      announce(`Letra escrita: ${letter}`);
      playSound('write');
    } else {
      announce('Ese patrón no corresponde a ninguna letra');
      playSound('error');
    }

    for (const dot of this.chordDots) this.setKeyVisual(dot, false);
    this.chordDots.clear();
    this.options.onInput?.(this.output);
  }

  private backspace(): void {
    if (this.output.length === 0) return;
    const removed = this.output[this.output.length - 1];
    this.output = this.output.slice(0, -1);
    this.updateOutput();
    announce(`Carácter eliminado: ${removed === ' ' ? 'espacio' : removed}`);
    playSound('backspace');
  }

  private updateOutput(): void {
    const outputEl = this.container.querySelector('.perkins-output');
    if (outputEl) {
      outputEl.textContent = this.output || 'Presiona las teclas para escribir en braille';
    }
  }

  getText(): string {
    return this.output;
  }
}
