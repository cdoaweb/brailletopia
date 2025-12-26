/* ============================================
   BRAILLETOPÍA - MÓDULO BRAILLE
   Celda Braille Interactiva + Teclado Perkins
   ============================================ */

// ========== CELDA BRAILLE INTERACTIVA ==========
class BrailleCell {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.options = {
      size: options.size || 'normal', // 'normal' o 'large'
      interactive: options.interactive !== false,
      showNumbers: options.showNumbers !== false,
      onChange: options.onChange || null
    };
    
    this.dots = [false, false, false, false, false, false]; // Estado de 6 puntos
    this.currentLetter = '';
    
    this.init();
  }
  
  init() {
    this.render();
    this.setupEventListeners();
  }
  
  render() {
    const cellClass = this.options.size === 'large' ? 'braille-cell large' : 'braille-cell';
    const dotClass = this.options.size === 'large' ? 'braille-dot large' : 'braille-dot';
    
    this.container.innerHTML = `
      <div class="braille-cell-container">
        ${this.currentLetter ? `<div class="braille-letter" aria-label="Letra: ${this.currentLetter}">${this.currentLetter}</div>` : ''}
        <div class="${cellClass}" role="group" aria-label="Celda braille de 6 puntos">
          ${this.dots.map((active, index) => `
            <button 
              class="${dotClass} ${active ? 'active' : ''}"
              data-dot="${index + 1}"
              aria-label="Punto ${index + 1}"
              aria-pressed="${active}"
              ${this.options.interactive ? '' : 'disabled'}
            >
              ${this.options.showNumbers ? index + 1 : ''}
            </button>
          `).join('')}
        </div>
        ${this.currentLetter ? `<div class="braille-description">Patrón braille para la letra "${this.currentLetter}"</div>` : ''}
      </div>
    `;
  }
  
  setupEventListeners() {
    if (!this.options.interactive) return;
    
    const dotButtons = this.container.querySelectorAll('.braille-dot');
    dotButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        this.toggleDot(index);
      });
      
      // Soporte de teclado
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleDot(index);
        }
      });
    });
  }
  
  toggleDot(index) {
    this.dots[index] = !this.dots[index];
    const button = this.container.querySelector(`[data-dot="${index + 1}"]`);
    
    if (button) {
      button.classList.toggle('active');
      button.setAttribute('aria-pressed', this.dots[index]);
      
      // Feedback auditivo
      this.playSound(this.dots[index] ? 'dot-on' : 'dot-off');
    }
    
    // Identificar letra si existe
    this.identifyLetter();
    
    // Callback
    if (this.options.onChange) {
      this.options.onChange(this.dots, this.currentLetter);
    }
    
    // Anunciar cambio
    const state = this.dots[index] ? 'activado' : 'desactivado';
    this.announce(`Punto ${index + 1} ${state}`);
  }
  
  setPattern(dots) {
    this.dots = [...dots];
    this.render();
    this.setupEventListeners();
    this.identifyLetter();
  }
  
  setLetter(letter) {
    const pattern = this.getPatternForLetter(letter);
    if (pattern) {
      this.currentLetter = letter.toUpperCase();
      this.setPattern(pattern);
    }
  }
  
  reset() {
    this.dots = [false, false, false, false, false, false];
    this.currentLetter = '';
    this.render();
    this.setupEventListeners();
    this.announce('Celda braille reiniciada');
  }
  
  identifyLetter() {
    const patternString = this.dots.map(d => d ? '1' : '0').join('');
    const letter = this.getLetterForPattern(patternString);
    
    if (letter) {
      this.currentLetter = letter;
      const letterDisplay = this.container.querySelector('.braille-letter');
      if (letterDisplay) {
        letterDisplay.textContent = letter;
        this.announce(`Letra identificada: ${letter}`);
      }
    } else {
      this.currentLetter = '';
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
      'Ñ': [true, false, true, false, true, true],
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
    
    return patterns[letter.toUpperCase()] || null;
  }
  
  getLetterForPattern(patternString) {
    const patterns = {
      '100000': 'A', '110000': 'B', '100100': 'C', '100110': 'D',
      '100010': 'E', '110100': 'F', '110110': 'G', '110010': 'H',
      '010100': 'I', '010110': 'J', '101000': 'K', '111000': 'L',
      '101100': 'M', '101110': 'N', '101010': 'O', '111100': 'P',
      '111110': 'Q', '111010': 'R', '011100': 'S', '011110': 'T',
      '101001': 'U', '111001': 'V', '010111': 'W', '101101': 'X',
      '101111': 'Y', '101011': 'Z', '101011': 'Ñ'
    };
    
    return patterns[patternString] || null;
  }
  
  playSound(type) {
    // Crear un sonido simple
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = type === 'dot-on' ? 800 : 400;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
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

// ========== TECLADO PERKINS VIRTUAL ==========
class PerkinsKeyboard {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.options = {
      onInput: options.onInput || null,
      showOutput: options.showOutput !== false
    };
    
    this.currentDots = [false, false, false, false, false, false];
    this.output = '';
    
    this.init();
  }
  
  init() {
    this.render();
    this.setupEventListeners();
    this.setupKeyboardInput();
  }
  
  render() {
    this.container.innerHTML = `
      <div>
        ${this.options.showOutput ? `
          <div class="perkins-output" role="textbox" aria-label="Salida del teclado Perkins" aria-live="polite">
            ${this.output || 'Presiona las teclas para escribir en braille'}
          </div>
        ` : ''}
        
        <div class="perkins-keyboard" role="group" aria-label="Teclado Perkins de 6 teclas">
          <button class="perkins-key" data-key="3" aria-label="Tecla 3 - Punto 3">
            <span class="perkins-key-number">3</span>
            <span class="perkins-key-label">●</span>
          </button>
          <button class="perkins-key" data-key="2" aria-label="Tecla 2 - Punto 2">
            <span class="perkins-key-number">2</span>
            <span class="perkins-key-label">●</span>
          </button>
          <button class="perkins-key" data-key="1" aria-label="Tecla 1 - Punto 1">
            <span class="perkins-key-number">1</span>
            <span class="perkins-key-label">●</span>
          </button>
          <button class="perkins-key" data-key="4" aria-label="Tecla 4 - Punto 4">
            <span class="perkins-key-number">4</span>
            <span class="perkins-key-label">●</span>
          </button>
          <button class="perkins-key" data-key="5" aria-label="Tecla 5 - Punto 5">
            <span class="perkins-key-number">5</span>
            <span class="perkins-key-label">●</span>
          </button>
          <button class="perkins-key" data-key="6" aria-label="Tecla 6 - Punto 6">
            <span class="perkins-key-number">6</span>
            <span class="perkins-key-label">●</span>
          </button>
          <button class="perkins-key perkins-space" data-key="space" aria-label="Tecla Espacio">
            ESPACIO
          </button>
          <button class="perkins-key perkins-backspace" data-key="backspace" aria-label="Tecla Retroceso">
            ← BORRAR
          </button>
        </div>
        
        <div style="margin-top: var(--space-md); text-align: center; color: var(--color-gray-700);">
          <p><strong>Instrucciones:</strong> Usa las teclas F, D, S, J, K, L o haz clic en las teclas.</p>
          <p>Presiona ESPACIO cuando estés listo para escribir la letra.</p>
        </div>
      </div>
    `;
  }
  
  setupEventListeners() {
    const keys = this.container.querySelectorAll('.perkins-key');
    
    keys.forEach(key => {
      const keyType = key.dataset.key;
      
      key.addEventListener('mousedown', () => {
        this.pressKey(keyType);
      });
      
      key.addEventListener('mouseup', () => {
        this.releaseKey(keyType);
      });
      
      key.addEventListener('mouseleave', () => {
        this.releaseKey(keyType);
      });
    });
  }
  
  setupKeyboardInput() {
    // Mapeo de teclas del teclado físico a puntos braille
    const keyMap = {
      'f': 1, 'd': 2, 's': 3,
      'j': 4, 'k': 5, 'l': 6,
      ' ': 'space',
      'Backspace': 'backspace'
    };
    
    document.addEventListener('keydown', (e) => {
      const key = keyMap[e.key.toLowerCase()];
      if (key) {
        e.preventDefault();
        this.pressKey(key);
      }
    });
    
    document.addEventListener('keyup', (e) => {
      const key = keyMap[e.key.toLowerCase()];
      if (key) {
        e.preventDefault();
        this.releaseKey(key);
      }
    });
  }
  
  pressKey(key) {
    const button = this.container.querySelector(`[data-key="${key}"]`);
    if (!button) return;
    
    button.classList.add('pressed');
    
    if (key === 'space') {
      this.writeCharacter();
    } else if (key === 'backspace') {
      this.backspace();
    } else {
      const dotIndex = parseInt(key) - 1;
      this.currentDots[dotIndex] = true;
      this.playSound('key');
    }
  }
  
  releaseKey(key) {
    const button = this.container.querySelector(`[data-key="${key}"]`);
    if (!button) return;
    
    button.classList.remove('pressed');
  }
  
  writeCharacter() {
    const pattern = this.currentDots.map(d => d ? '1' : '0').join('');
    const letter = this.getLetterForPattern(pattern);
    
    if (letter) {
      this.output += letter;
      this.updateOutput();
      this.announce(`Letra escrita: ${letter}`);
      this.playSound('write');
    } else if (pattern === '000000') {
      // Espacio
      this.output += ' ';
      this.updateOutput();
      this.announce('Espacio añadido');
    }
    
    // Resetear puntos
    this.currentDots = [false, false, false, false, false, false];
    
    // Callback
    if (this.options.onInput) {
      this.options.onInput(this.output);
    }
  }
  
  backspace() {
    if (this.output.length > 0) {
      const removed = this.output[this.output.length - 1];
      this.output = this.output.slice(0, -1);
      this.updateOutput();
      this.announce(`Carácter eliminado: ${removed}`);
      this.playSound('backspace');
    }
  }
  
  updateOutput() {
    const outputEl = this.container.querySelector('.perkins-output');
    if (outputEl) {
      outputEl.textContent = this.output || 'Presiona las teclas para escribir en braille';
    }
  }
  
  clear() {
    this.output = '';
    this.currentDots = [false, false, false, false, false, false];
    this.updateOutput();
    this.announce('Texto borrado');
  }
  
  getText() {
    return this.output;
  }
  
  getLetterForPattern(patternString) {
    const patterns = {
      '100000': 'A', '110000': 'B', '100100': 'C', '100110': 'D',
      '100010': 'E', '110100': 'F', '110110': 'G', '110010': 'H',
      '010100': 'I', '010110': 'J', '101000': 'K', '111000': 'L',
      '101100': 'M', '101110': 'N', '101010': 'O', '111100': 'P',
      '111110': 'Q', '111010': 'R', '011100': 'S', '011110': 'T',
      '101001': 'U', '111001': 'V', '010111': 'W', '101101': 'X',
      '101111': 'Y', '101011': 'Z'
    };
    
    return patterns[patternString] || null;
  }
  
  playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies = {
      'key': 600,
      'write': 1000,
      'backspace': 300
    };
    
    oscillator.frequency.value = frequencies[type] || 600;
    gainNode.gain.value = 0.08;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.08);
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

// Exportar clases
export { BrailleCell, PerkinsKeyboard };
