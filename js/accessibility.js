/* ============================================
   BRAILLETOPÍA - MÓDULO DE ACCESIBILIDAD
   Gestión de controles de accesibilidad
   ============================================ */

class AccessibilityManager {
  constructor() {
    this.settings = {
      textSize: 'normal',
      contrast: 'normal',
      narrator: false,
      focusIndicator: true
    };
    
    this.init();
  }
  
  init() {
    this.loadSettings();
    this.setupPanel();
    this.setupControls();
    this.setupFocusIndicator();
    this.applySettings();
    this.setupKeyboardShortcuts();
  }
  
  // ========== CONFIGURACIÓN INICIAL ==========
  loadSettings() {
    const saved = localStorage.getItem('brailletopia-accessibility');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }
  
  saveSettings() {
    localStorage.setItem('brailletopia-accessibility', JSON.stringify(this.settings));
  }
  
  // ========== PANEL DE ACCESIBILIDAD ==========
  setupPanel() {
    const toggle = document.getElementById('accessibility-toggle');
    const panel = document.getElementById('accessibility-panel');
    const close = document.getElementById('accessibility-close');
    
    if (!toggle || !panel) return;
    
    toggle.addEventListener('click', () => {
      panel.classList.toggle('active');
      const isOpen = panel.classList.contains('active');
      toggle.setAttribute('aria-expanded', isOpen);
      
      if (isOpen) {
        this.announce('Panel de accesibilidad abierto');
        // Enfocar el primer control
        const firstControl = panel.querySelector('button, [role="button"]');
        if (firstControl) firstControl.focus();
      } else {
        this.announce('Panel de accesibilidad cerrado');
      }
    });
    
    if (close) {
      close.addEventListener('click', () => {
        panel.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
        this.announce('Panel de accesibilidad cerrado');
      });
    }
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('active')) {
        panel.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }
  
  // ========== CONTROLES ==========
  setupControls() {
    // Tamaño de texto
    const textSizeButtons = document.querySelectorAll('[data-text-size]');
    textSizeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const size = button.dataset.textSize;
        this.setTextSize(size);
        this.updateButtonStates(textSizeButtons, button);
      });
    });
    
    // Contraste
    const contrastButtons = document.querySelectorAll('[data-contrast]');
    contrastButtons.forEach(button => {
      button.addEventListener('click', () => {
        const contrast = button.dataset.contrast;
        this.setContrast(contrast);
        this.updateButtonStates(contrastButtons, button);
      });
    });
    
    // Narrador
    const narratorToggle = document.getElementById('narrator-toggle');
    if (narratorToggle) {
      narratorToggle.addEventListener('click', () => {
        this.toggleNarrator();
      });
    }
  }
  
  updateButtonStates(buttons, activeButton) {
    buttons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-pressed', 'true');
  }
  
  // ========== TAMAÑO DE TEXTO ==========
  setTextSize(size) {
    this.settings.textSize = size;
    document.documentElement.setAttribute('data-text-size', size);
    this.saveSettings();
    
    const messages = {
      normal: 'Tamaño de texto normal activado',
      large: 'Tamaño de texto grande activado',
      xlarge: 'Tamaño de texto extra grande activado'
    };
    
    this.announce(messages[size] || messages.normal);
  }
  
  // ========== CONTRASTE ==========
  setContrast(contrast) {
    this.settings.contrast = contrast;
    document.documentElement.setAttribute('data-contrast', contrast);
    this.saveSettings();
    
    const messages = {
      normal: 'Contraste normal activado',
      high: 'Alto contraste activado'
    };
    
    this.announce(messages[contrast] || messages.normal);
  }
  
  // ========== NARRADOR ==========
  toggleNarrator() {
    this.settings.narrator = !this.settings.narrator;
    const toggle = document.getElementById('narrator-toggle');
    
    if (toggle) {
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-pressed', this.settings.narrator);
    }
    
    this.saveSettings();
    
    if (this.settings.narrator) {
      this.announce('Narrador activado. Los elementos se leerán al enfocarlos.');
      this.startNarrator();
    } else {
      this.announce('Narrador desactivado');
      this.stopNarrator();
    }
  }
  
  startNarrator() {
    // Narrar elementos al recibir foco
    document.addEventListener('focus', this.narrateElement, true);
    // Narrar elementos al pasar el mouse (opcional)
    document.addEventListener('mouseenter', this.narrateElement, true);
  }
  
  stopNarrator() {
    document.removeEventListener('focus', this.narrateElement, true);
    document.removeEventListener('mouseenter', this.narrateElement, true);
  }
  
  narrateElement = (e) => {
    if (!this.settings.narrator) return;
    
    const element = e.target;
    let text = '';
    
    // Obtener texto del aria-label o título
    if (element.hasAttribute('aria-label')) {
      text = element.getAttribute('aria-label');
    } else if (element.hasAttribute('title')) {
      text = element.getAttribute('title');
    } else if (element.hasAttribute('alt')) {
      text = element.getAttribute('alt');
    } else if (element.tagName === 'BUTTON' || element.tagName === 'A') {
      text = element.textContent.trim();
    } else if (element.tagName === 'INPUT') {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) {
        text = label.textContent.trim();
      } else {
        text = element.placeholder || element.name || 'Campo de entrada';
      }
    }
    
    if (text) {
      this.speak(text);
    }
  }
  
  speak(text) {
    if ('speechSynthesis' in window) {
      // Cancelar cualquier narración en curso
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9; // Velocidad pausada
      utterance.pitch = 1;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  }
  
  // ========== INDICADOR DE FOCO ==========
  setupFocusIndicator() {
    let focusIndicator = document.getElementById('keyboard-focus-indicator');
    
    if (!focusIndicator) {
      focusIndicator = document.createElement('div');
      focusIndicator.id = 'keyboard-focus-indicator';
      focusIndicator.className = 'keyboard-focus-indicator';
      focusIndicator.setAttribute('aria-hidden', 'true');
      document.body.appendChild(focusIndicator);
    }
    
    let isKeyboard = false;
    
    // Detectar navegación por teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        isKeyboard = true;
      }
    });
    
    document.addEventListener('mousedown', () => {
      isKeyboard = false;
    });
    
    // Mostrar indicador en elementos enfocados
    document.addEventListener('focusin', (e) => {
      if (!isKeyboard || !this.settings.focusIndicator) {
        focusIndicator.classList.remove('active');
        return;
      }
      
      const element = e.target;
      const rect = element.getBoundingClientRect();
      
      focusIndicator.style.top = `${rect.top + window.scrollY - 4}px`;
      focusIndicator.style.left = `${rect.left + window.scrollX - 4}px`;
      focusIndicator.style.width = `${rect.width + 8}px`;
      focusIndicator.style.height = `${rect.height + 8}px`;
      focusIndicator.classList.add('active');
    });
    
    document.addEventListener('focusout', () => {
      focusIndicator.classList.remove('active');
    });
  }
  
  // ========== ATAJOS DE TECLADO ==========
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + A: Abrir panel de accesibilidad
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        const toggle = document.getElementById('accessibility-toggle');
        if (toggle) toggle.click();
      }
      
      // Alt + N: Toggle narrador
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        this.toggleNarrator();
      }
      
      // Alt + 1, 2, 3: Cambiar tamaño de texto
      if (e.altKey && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        const sizes = { '1': 'normal', '2': 'large', '3': 'xlarge' };
        this.setTextSize(sizes[e.key]);
      }
      
      // Alt + C: Toggle contraste
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        const newContrast = this.settings.contrast === 'normal' ? 'high' : 'normal';
        this.setContrast(newContrast);
      }
    });
  }
  
  // ========== ANUNCIOS ARIA ==========
  announce(message, priority = 'polite') {
    let announcer = document.getElementById('sr-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.className = 'sr-announcement';
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    }
    
    // Limpiar y anunciar
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }
  
  // ========== APLICAR CONFIGURACIÓN ==========
  applySettings() {
    this.setTextSize(this.settings.textSize);
    this.setContrast(this.settings.contrast);
    
    if (this.settings.narrator) {
      const toggle = document.getElementById('narrator-toggle');
      if (toggle) {
        toggle.classList.add('active');
        toggle.setAttribute('aria-pressed', 'true');
      }
      this.startNarrator();
    }
    
    // Actualizar estados de botones
    const textSizeButton = document.querySelector(`[data-text-size="${this.settings.textSize}"]`);
    if (textSizeButton) {
      textSizeButton.classList.add('active');
      textSizeButton.setAttribute('aria-pressed', 'true');
    }
    
    const contrastButton = document.querySelector(`[data-contrast="${this.settings.contrast}"]`);
    if (contrastButton) {
      contrastButton.classList.add('active');
      contrastButton.setAttribute('aria-pressed', 'true');
    }
  }
}

// ========== FUNCIONES DE UTILIDAD ==========

// Hacer elementos interactivos accesibles por teclado
function makeAccessible(element, callback) {
  element.setAttribute('tabindex', '0');
  element.setAttribute('role', 'button');
  
  element.addEventListener('click', callback);
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback(e);
    }
  });
}

// Trap focus dentro de un modal
function trapFocus(container) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });
  
  // Enfocar el primer elemento
  if (firstFocusable) firstFocusable.focus();
}

// Exportar para uso en otros módulos
export { AccessibilityManager, makeAccessible, trapFocus };
