/* ============================================
   BRAILLETOPÍA - JUEGO: ADIVINA LA LETRA
   Muestra un patrón braille y el jugador elige la letra.
   Las puntuaciones se guardan en la base de datos local.
   ============================================ */

import { BRAILLE_ALPHABET, getPatternForLetter } from '../data/braille';
import { announce } from '../core/announcer';
import { playSound } from '../core/audio';
import { db } from '../core/db';
import { getSession } from '../core/auth';

export type GameLevel = 'easy' | 'medium' | 'hard';

export interface GuessGameOptions {
  level?: GameLevel;
  onComplete?: (score: number, percentage: number) => void;
}

const LEVEL_LETTERS: Record<GameLevel, string[]> = {
  easy: ['A', 'B', 'C', 'D', 'E'],
  medium: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  hard: Object.keys(BRAILLE_ALPHABET),
};

const LEVEL_NAMES: Record<GameLevel, string> = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
};

const HINTS: Record<string, string> = {
  A: 'Es la primera letra del alfabeto: solo el punto 1',
  B: 'Viene después de la A: puntos 1 y 2',
  C: 'Es la tercera letra: puntos 1 y 4',
  D: 'La cuarta letra: puntos 1, 4 y 5',
  E: 'Es la vocal más común en español',
  F: 'Suena como "efe"',
  G: 'Suena como "ge"',
  H: 'Es una letra muda en español',
  I: 'Es una vocal cerrada',
  J: 'Suena como "jota"',
};

const POINTS_PER_QUESTION = 10;
const MAX_QUESTIONS = 10;

export class GuessTheLetterGame {
  private container: HTMLElement;
  private options: GuessGameOptions;
  private letters: string[];
  private score = 0;
  private question = 0;
  private currentLetter = '';
  private saved = false;

  constructor(container: HTMLElement, options: GuessGameOptions = {}) {
    this.container = container;
    this.options = options;
    this.letters = LEVEL_LETTERS[options.level ?? 'easy'];
    this.start();
  }

  private start(): void {
    this.score = 0;
    this.question = 0;
    this.saved = false;
    this.renderShell();
    this.nextQuestion();
  }

  private renderShell(): void {
    this.container.innerHTML = `
      <div class="game-container" role="application" aria-label="Juego de adivinar letras braille">
        <div class="game-header">
          <h2>¡Adivina la Letra Braille!</h2>
          <p>Nivel: ${LEVEL_NAMES[this.options.level ?? 'easy']}</p>
          <div class="game-stats">
            <div class="stat">
              <span class="stat-label">Puntuación:</span>
              <span class="stat-value" data-role="score">0</span>
            </div>
            <div class="stat">
              <span class="stat-label">Pregunta:</span>
              <span class="stat-value" data-role="progress">0/${MAX_QUESTIONS}</span>
            </div>
          </div>
        </div>

        <div class="game-content">
          <div class="game-question">
            <p class="game-instruction">Observa el patrón braille y adivina la letra:</p>
            <div data-role="braille-display"></div>
          </div>

          <div class="game-answers" role="group" aria-label="Opciones de respuesta">
            <div data-role="options" class="game-options-grid"></div>
          </div>

          <div data-role="feedback" class="game-feedback" role="status" aria-live="assertive"></div>
        </div>

        <div class="game-controls">
          <button class="btn btn-secondary" data-role="hint" aria-label="Pedir una pista">💡 Pista</button>
          <button class="btn btn-outline" data-role="skip" aria-label="Saltar pregunta">⏭️ Saltar</button>
        </div>
      </div>
    `;

    this.query('hint').addEventListener('click', () => this.showHint());
    this.query('skip').addEventListener('click', () => this.nextQuestion());
  }

  private query(role: string): HTMLElement {
    const el = this.container.querySelector<HTMLElement>(`[data-role="${role}"]`);
    if (!el) throw new Error(`Elemento del juego no encontrado: ${role}`);
    return el;
  }

  private nextQuestion(): void {
    if (this.question >= MAX_QUESTIONS) {
      this.endGame();
      return;
    }

    this.currentLetter = this.letters[Math.floor(Math.random() * this.letters.length)];
    this.question++;

    this.updateStats();
    this.displayPattern();
    this.displayOptions();
    this.query('feedback').innerHTML = '';
    this.query('feedback').className = 'game-feedback';

    announce(`Pregunta ${this.question}. Adivina la letra que representa este patrón braille.`);
  }

  private displayPattern(): void {
    const pattern = getPatternForLetter(this.currentLetter);
    if (!pattern) return;

    this.query('braille-display').innerHTML = `
      <div class="braille-cell large" style="margin: 0 auto;">
        ${pattern
          .map(
            (active, index) => `
          <div class="braille-dot large${active ? ' active' : ''}"
               aria-label="Punto ${index + 1} ${active ? 'activo' : 'inactivo'}">
            ${index + 1}
          </div>`,
          )
          .join('')}
      </div>
    `;
  }

  private displayOptions(): void {
    const options = [this.currentLetter];
    while (options.length < Math.min(4, this.letters.length)) {
      const random = this.letters[Math.floor(Math.random() * this.letters.length)];
      if (!options.includes(random)) options.push(random);
    }
    options.sort(() => Math.random() - 0.5);

    const optionsEl = this.query('options');
    optionsEl.innerHTML = options
      .map(
        (letter) => `
      <button class="game-option btn btn-xl" data-answer="${letter}" aria-label="Opción: ${letter}">
        ${letter}
      </button>`,
      )
      .join('');

    optionsEl.querySelectorAll<HTMLButtonElement>('.game-option').forEach((btn) => {
      btn.addEventListener('click', () => this.checkAnswer(btn.dataset.answer ?? ''));
    });
  }

  private checkAnswer(answer: string): void {
    this.container
      .querySelectorAll<HTMLButtonElement>('.game-option')
      .forEach((btn) => (btn.disabled = true));

    if (answer === this.currentLetter) {
      this.score += POINTS_PER_QUESTION;
      this.showFeedback('¡Correcto! 🎉', 'success');
      playSound('success');
      window.setTimeout(() => this.nextQuestion(), 1500);
    } else {
      this.showFeedback(`Incorrecto. La respuesta era "${this.currentLetter}".`, 'error');
      playSound('error');
      window.setTimeout(() => this.nextQuestion(), 2500);
    }
    this.updateStats();
  }

  private showHint(): void {
    const hint =
      HINTS[this.currentLetter] ??
      `Está entre las letras ${this.letters[0]} y ${this.letters[this.letters.length - 1]}`;
    this.showFeedback(`💡 Pista: ${hint}`, 'info');
  }

  private showFeedback(message: string, type: 'success' | 'error' | 'info'): void {
    const feedback = this.query('feedback');
    feedback.className = `game-feedback alert alert-${type}`;
    feedback.innerHTML = `<div class="alert-content"><p>${message}</p></div>`;
    announce(message);
  }

  private updateStats(): void {
    this.query('score').textContent = String(this.score);
    this.query('progress').textContent = `${this.question}/${MAX_QUESTIONS}`;
  }

  private saveScore(): void {
    if (this.saved) return;
    this.saved = true;

    const session = getSession();
    db.insert('scores', {
      userId: session?.userId ?? null,
      playerName: session?.name ?? 'Invitado',
      game: 'guess-letter',
      level: this.options.level ?? 'easy',
      score: this.score,
      maxScore: MAX_QUESTIONS * POINTS_PER_QUESTION,
      playedAt: new Date().toISOString(),
    });
  }

  private endGame(): void {
    const maxScore = MAX_QUESTIONS * POINTS_PER_QUESTION;
    const percentage = (this.score / maxScore) * 100;
    this.saveScore();

    let message: string;
    if (percentage >= 80) {
      message = '¡Excelente trabajo! Dominas el braille. 🌟';
    } else if (percentage >= 60) {
      message = '¡Bien hecho! Sigues mejorando. 👍';
    } else {
      message = 'Sigue practicando. ¡Tú puedes! 💪';
    }

    const best = db
      .filter('scores', (s) => s.game === 'guess-letter')
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    this.container.innerHTML = `
      <div class="game-results">
        <h2>¡Juego Terminado!</h2>
        <div class="results-stats">
          <div class="result-stat">
            <span class="stat-label">Puntuación Final:</span>
            <span class="stat-value">${this.score} / ${maxScore}</span>
          </div>
          <div class="result-stat">
            <span class="stat-label">Porcentaje:</span>
            <span class="stat-value">${percentage.toFixed(0)}%</span>
          </div>
        </div>
        <p class="result-message">${message}</p>

        <h3 style="margin-top: var(--space-xl);">🏆 Mejores puntuaciones</h3>
        <ol style="max-width: 400px; margin: var(--space-md) auto; text-align: left;">
          ${best
            .map(
              (s) =>
                `<li style="margin-bottom: var(--space-xs);">
                  <strong>${s.playerName}</strong> — ${s.score} pts (${LEVEL_NAMES[s.level as GameLevel] ?? s.level})
                </li>`,
            )
            .join('')}
        </ol>

        <div class="game-controls">
          <button class="btn btn-primary btn-xl" data-role="restart">🔄 Jugar de Nuevo</button>
          <a href="cursos.html" class="btn btn-secondary btn-xl">📚 Ver Cursos</a>
        </div>
      </div>
    `;

    announce(`Juego terminado. Puntuación final: ${this.score} puntos. ${message}`);
    this.query('restart').addEventListener('click', () => this.start());
    this.options.onComplete?.(this.score, percentage);
  }
}
