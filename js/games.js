/* ============================================
   BRAILLETOPÍA - MÓDULO DE JUEGOS
   Juegos Educativos Accesibles
   ============================================ */

// ========== JUEGO: ADIVINA LA LETRA ==========
class GuessTheLetterGame {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.options = {
      level: options.level || 'easy', // easy, medium, hard
      onComplete: options.onComplete || null,
      timeLimit: options.timeLimit || null
    };
    
    this.score = 0;
    this.attempts = 0;
    this.maxAttempts = 10;
    this.currentLetter = '';
    this.letters = this.getLettersForLevel();
    
    this.init();
  }
  
  init() {
    this.render();
    this.nextQuestion();
  }
  
  getLettersForLevel() {
    const levels = {
      easy: ['A', 'B', 'C', 'D', 'E'],
      medium: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      hard: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    };
    
    return levels[this.options.level] || levels.easy;
  }
  
  render() {
    this.container.innerHTML = `
      <div class="game-container" role="application" aria-label="Juego de adivinar letras braille">
        <div class="game-header">
          <h2>¡Adivina la Letra Braille!</h2>
          <div class="game-stats">
            <div class="stat">
              <span class="stat-label">Puntuación:</span>
              <span class="stat-value" id="game-score">0</span>
            </div>
            <div class="stat">
              <span class="stat-label">Pregunta:</span>
              <span class="stat-value" id="game-attempts">0/10</span>
            </div>
          </div>
        </div>
        
        <div class="game-content">
          <div class="game-question" aria-live="polite">
            <p class="game-instruction">Observa el patrón braille y adivina la letra:</p>
            <div id="game-braille-display"></div>
          </div>
          
          <div class="game-answers" role="group" aria-label="Opciones de respuesta">
            <div id="game-options" class="game-options-grid"></div>
          </div>
          
          <div id="game-feedback" class="game-feedback" role="alert" aria-live="assertive"></div>
        </div>
        
        <div class="game-controls">
          <button class="btn btn-secondary" id="game-hint" aria-label="Pedir una pista">
            💡 Pista
          </button>
          <button class="btn btn-outline" id="game-skip" aria-label="Saltar pregunta">
            ⏭️ Saltar
          </button>
        </div>
      </div>
    `;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    const hintBtn = this.container.querySelector('#game-hint');
    const skipBtn = this.container.querySelector('#game-skip');
    
    if (hintBtn) {
      hintBtn.addEventListener('click', () => this.showHint());
    }
    
    if (skipBtn) {
      skipBtn.addEventListener('click', () => this.nextQuestion());
    }
  }
  
  nextQuestion() {
    if (this.attempts >= this.maxAttempts) {
      this.endGame();
      return;
    }
    
    // Seleccionar letra aleatoria
    this.currentLetter = this.letters[Math.floor(Math.random() * this.letters.length)];
    this.attempts++;
    
    // Actualizar interfaz
    this.updateStats();
    this.displayBraillePattern();
    this.displayOptions();
    this.clearFeedback();
    
    // Anunciar nueva pregunta
    this.announce(`Pregunta ${this.attempts}. Adivina la letra que representa este patrón braille.`);
  }
  
  displayBraillePattern() {
    const display = this.container.querySelector('#game-braille-display');
    if (!display) return;
    
    const pattern = this.getPatternForLetter(this.currentLetter);
    if (!pattern) return;
    
    display.innerHTML = `
      <div class="braille-cell large">
        ${pattern.map((active, index) => `
          <div class="braille-dot large ${active ? 'active' : ''}" aria-label="Punto ${index + 1} ${active ? 'activo' : 'inactivo'}">
            ${index + 1}
          </div>
        `).join('')}
      </div>
    `;
  }
  
  displayOptions() {
    const optionsContainer = this.container.querySelector('#game-options');
    if (!optionsContainer) return;
    
    // Crear 4 opciones: la correcta + 3 incorrectas
    const options = [this.currentLetter];
    
    while (options.length < 4) {
      const randomLetter = this.letters[Math.floor(Math.random() * this.letters.length)];
      if (!options.includes(randomLetter)) {
        options.push(randomLetter);
      }
    }
    
    // Mezclar opciones
    options.sort(() => Math.random() - 0.5);
    
    optionsContainer.innerHTML = options.map(letter => `
      <button class="game-option btn btn-xl" data-answer="${letter}" aria-label="Opción: ${letter}">
        ${letter}
      </button>
    `).join('');
    
    // Event listeners para opciones
    const optionButtons = optionsContainer.querySelectorAll('.game-option');
    optionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.checkAnswer(btn.dataset.answer);
      });
    });
  }
  
  checkAnswer(answer) {
    const isCorrect = answer === this.currentLetter;
    
    if (isCorrect) {
      this.score += 10;
      this.showFeedback('¡Correcto! 🎉', 'success');
      this.playSound('success');
      setTimeout(() => this.nextQuestion(), 2000);
    } else {
      this.showFeedback(`Incorrecto. La respuesta era "${this.currentLetter}". Intenta la siguiente.`, 'error');
      this.playSound('error');
      setTimeout(() => this.nextQuestion(), 3000);
    }
    
    this.updateStats();
    
    // Deshabilitar botones
    const options = this.container.querySelectorAll('.game-option');
    options.forEach(btn => btn.disabled = true);
  }
  
  showHint() {
    const hints = {
      'A': 'Es la primera letra del alfabeto',
      'B': 'Viene después de A',
      'C': 'Es la tercera letra',
      'D': 'Rima con "red"',
      'E': 'Es la vocal más común en español',
      'F': 'Suena como "efe"',
      'G': 'Suena como "ge"',
      'H': 'Es una letra muda en español',
      'I': 'Es una vocal cerrada',
      'J': 'Suena como "jota"'
    };
    
    const hint = hints[this.currentLetter] || `La letra está entre ${this.letters[0]} y ${this.letters[this.letters.length-1]}`;
    this.showFeedback(`💡 Pista: ${hint}`, 'info');
    this.announce(hint);
  }
  
  showFeedback(message, type) {
    const feedback = this.container.querySelector('#game-feedback');
    if (!feedback) return;
    
    feedback.className = `game-feedback alert alert-${type}`;
    feedback.innerHTML = `
      <div class="alert-content">
        <p>${message}</p>
      </div>
    `;
    
    this.announce(message);
  }
  
  clearFeedback() {
    const feedback = this.container.querySelector('#game-feedback');
    if (feedback) {
      feedback.innerHTML = '';
      feedback.className = 'game-feedback';
    }
  }
  
  updateStats() {
    const scoreEl = this.container.querySelector('#game-score');
    const attemptsEl = this.container.querySelector('#game-attempts');
    
    if (scoreEl) scoreEl.textContent = this.score;
    if (attemptsEl) attemptsEl.textContent = `${this.attempts}/${this.maxAttempts}`;
  }
  
  endGame() {
    const percentage = (this.score / (this.maxAttempts * 10)) * 100;
    let message = '';
    
    if (percentage >= 80) {
      message = '¡Excelente trabajo! Dominas el braille. 🌟';
    } else if (percentage >= 60) {
      message = '¡Bien hecho! Sigues mejorando. 👍';
    } else {
      message = 'Sigue practicando. ¡Tú puedes! 💪';
    }
    
    this.container.innerHTML = `
      <div class="game-results">
        <h2>¡Juego Terminado!</h2>
        <div class="results-stats">
          <div class="result-stat">
            <span class="stat-label">Puntuación Final:</span>
            <span class="stat-value">${this.score} / ${this.maxAttempts * 10}</span>
          </div>
          <div class="result-stat">
            <span class="stat-label">Porcentaje:</span>
            <span class="stat-value">${percentage.toFixed(0)}%</span>
          </div>
        </div>
        <p class="result-message">${message}</p>
        <div class="game-controls">
          <button class="btn btn-primary btn-xl" id="game-restart">
            🔄 Jugar de Nuevo
          </button>
          <a href="cursos.html" class="btn btn-secondary btn-xl">
            📚 Ver Cursos
          </a>
        </div>
      </div>
    `;
    
    this.announce(`Juego terminado. Puntuación final: ${this.score} puntos. ${message}`);
    
    const restartBtn = this.container.querySelector('#game-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.score = 0;
        this.attempts = 0;
        this.init();
      });
    }
    
    if (this.options.onComplete) {
      this.options.onComplete(this.score, percentage);
    }
  }
  
  getPatternForLetter(letter) {
    const patterns = {
      'A': [true, false, false, false, false, false],
      'B': [true, true, false, false, false, false],
      'C': [true, false, false, true, false, false],
      'D': [true, false, false, true, true, false],
      'E': [true, false, false, false, true, false],
      'F': [true, true, false, true, false, false],
      'G': [true, true, false, true, true, false],
      'H': [true, true, false, false, true, false],
      'I': [false, true, false, true, false, false],
      'J': [false, true, false, true, true, false],
      'K': [true, false, true, false, false, false],
      'L': [true, true, true, false, false, false],
      'M': [true, false, true, true, false, false],
      'N': [true, false, true, true, true, false],
      'O': [true, false, true, false, true, false],
      'P': [true, true, true, true, false, false],
      'Q': [true, true, true, true, true, false],
      'R': [true, true, true, false, true, false],
      'S': [false, true, true, true, false, false],
      'T': [false, true, true, true, true, false],
      'U': [true, false, true, false, false, true],
      'V': [true, true, true, false, false, true],
      'W': [false, true, false, true, true, true],
      'X': [true, false, true, true, false, true],
      'Y': [true, false, true, true, true, true],
      'Z': [true, false, true, false, true, true]
    };
    
    return patterns[letter] || null;
  }
  
  playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'success') {
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === 'error') {
      oscillator.frequency.value = 300;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  }
  
  announce(message) {
    const announcer = document.getElementById('sr-announcer') || (() => {
      const el = document.createElement('div');
      el.id = 'sr-announcer';
      el.className = 'sr-announcement';
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
      return el;
    })();
    
    announcer.textContent = '';
    setTimeout(() => announcer.textContent = message, 100);
  }
}

// Estilos adicionales para el juego
const gameStyles = `
.game-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-xl);
}

.game-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.game-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-xl);
  margin-top: var(--space-md);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-md);
  background: var(--color-gray-100);
  border-radius: var(--border-radius-sm);
  min-width: 120px;
}

.stat-label {
  font-size: var(--font-size-small);
  color: var(--color-gray-700);
  margin-bottom: var(--space-xs);
}

.stat-value {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.game-question {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.game-instruction {
  font-size: var(--font-size-large);
  margin-bottom: var(--space-lg);
  color: var(--color-gray-900);
}

.game-options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.game-option {
  font-size: var(--font-size-h2);
  min-height: 80px;
}

.game-feedback {
  min-height: 60px;
  margin-bottom: var(--space-lg);
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.game-results {
  text-align: center;
  padding: var(--space-xxl);
}

.results-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-xl);
  margin: var(--space-xl) 0;
}

.result-stat {
  display: flex;
  flex-direction: column;
  padding: var(--space-lg);
  background: var(--color-gray-100);
  border-radius: var(--border-radius-md);
  min-width: 200px;
}

.result-message {
  font-size: var(--font-size-h3);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  margin: var(--space-xl) 0;
}

@media (max-width: 768px) {
  .game-options-grid {
    grid-template-columns: 1fr;
  }
  
  .game-stats,
  .results-stats {
    flex-direction: column;
  }
}
`;

// Inyectar estilos si no existen
if (!document.getElementById('game-styles')) {
  const style = document.createElement('style');
  style.id = 'game-styles';
  style.textContent = gameStyles;
  document.head.appendChild(style);
}

export { GuessTheLetterGame };
