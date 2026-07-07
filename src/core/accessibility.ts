/* ============================================
   BRAILLETOPÍA - GESTOR DE ACCESIBILIDAD
   Tamaño de texto, contraste, narrador y atajos de teclado.
   Debe inicializarse DESPUÉS de renderizar el panel de
   accesibilidad (ver components/layout.ts).
   ============================================ */

import { announce } from './announcer';

type TextSize = 'normal' | 'large' | 'xlarge';
type Contrast = 'normal' | 'high';

interface AccessibilitySettings {
  textSize: TextSize;
  contrast: Contrast;
  narrator: boolean;
}

const STORAGE_KEY = 'brailletopia-accessibility';

const TEXT_SIZE_MESSAGES: Record<TextSize, string> = {
  normal: 'Tamaño de texto normal activado',
  large: 'Tamaño de texto grande activado',
  xlarge: 'Tamaño de texto extra grande activado',
};

const CONTRAST_MESSAGES: Record<Contrast, string> = {
  normal: 'Contraste normal activado',
  high: 'Alto contraste activado',
};

export class AccessibilityManager {
  private settings: AccessibilitySettings = {
    textSize: 'normal',
    contrast: 'normal',
    narrator: false,
  };

  constructor() {
    this.loadSettings();
    this.setupPanel();
    this.setupControls();
    this.applySettings();
    this.setupKeyboardShortcuts();
  }

  announce(message: string): void {
    announce(message);
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) this.settings = { ...this.settings, ...JSON.parse(saved) };
    } catch {
      // configuración corrupta: se usa la de por defecto
    }
  }

  private saveSettings(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
  }

  private setupPanel(): void {
    const toggle = document.getElementById('accessibility-toggle');
    const panel = document.getElementById('accessibility-panel');
    const close = document.getElementById('accessibility-close');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('active');
      toggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        announce('Panel de accesibilidad abierto');
        panel.querySelector<HTMLElement>('button')?.focus();
      } else {
        announce('Panel de accesibilidad cerrado');
      }
    });

    const closePanel = () => {
      panel.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
      announce('Panel de accesibilidad cerrado');
    };

    close?.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('active')) closePanel();
    });
  }

  private setupControls(): void {
    document.querySelectorAll<HTMLButtonElement>('[data-text-size]').forEach((button) => {
      button.addEventListener('click', () => {
        this.setTextSize(button.dataset.textSize as TextSize);
      });
    });

    document.querySelectorAll<HTMLButtonElement>('[data-contrast]').forEach((button) => {
      button.addEventListener('click', () => {
        this.setContrast(button.dataset.contrast as Contrast);
      });
    });

    document.getElementById('narrator-toggle')?.addEventListener('click', () => {
      this.toggleNarrator();
    });
  }

  private syncButtonGroup(attribute: string, value: string): void {
    document.querySelectorAll<HTMLButtonElement>(`[data-${attribute}]`).forEach((btn) => {
      const isActive = btn.dataset[attribute === 'text-size' ? 'textSize' : attribute] === value;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  setTextSize(size: TextSize): void {
    this.settings.textSize = size;
    document.documentElement.setAttribute('data-text-size', size);
    this.syncButtonGroup('text-size', size);
    this.saveSettings();
    announce(TEXT_SIZE_MESSAGES[size]);
  }

  setContrast(contrast: Contrast): void {
    this.settings.contrast = contrast;
    document.documentElement.setAttribute('data-contrast', contrast);
    this.syncButtonGroup('contrast', contrast);
    this.saveSettings();
    announce(CONTRAST_MESSAGES[contrast]);
  }

  toggleNarrator(): void {
    this.settings.narrator = !this.settings.narrator;
    this.syncNarratorToggle();
    this.saveSettings();

    if (this.settings.narrator) {
      announce('Narrador activado. Los elementos se leerán al enfocarlos.');
      this.startNarrator();
    } else {
      announce('Narrador desactivado');
      this.stopNarrator();
      window.speechSynthesis?.cancel();
    }
  }

  private syncNarratorToggle(): void {
    const toggle = document.getElementById('narrator-toggle');
    if (toggle) {
      toggle.classList.toggle('active', this.settings.narrator);
      toggle.setAttribute('aria-checked', String(this.settings.narrator));
    }
  }

  private startNarrator(): void {
    document.addEventListener('focusin', this.narrateElement);
  }

  private stopNarrator(): void {
    document.removeEventListener('focusin', this.narrateElement);
  }

  private narrateElement = (e: Event): void => {
    if (!this.settings.narrator) return;
    const element = e.target as HTMLElement;
    let text = '';

    if (element.hasAttribute('aria-label')) {
      text = element.getAttribute('aria-label') ?? '';
    } else if (element.hasAttribute('title')) {
      text = element.getAttribute('title') ?? '';
    } else if (element.tagName === 'BUTTON' || element.tagName === 'A') {
      text = element.textContent?.trim() ?? '';
    } else if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      const label = element.id
        ? document.querySelector(`label[for="${element.id}"]`)
        : null;
      text = label?.textContent?.trim() ?? element.placeholder ?? 'Campo de entrada';
    }

    if (text) this.speak(text);
  };

  private speak(text: string): void {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (!e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'a':
          e.preventDefault();
          document.getElementById('accessibility-toggle')?.click();
          break;
        case 'n':
          e.preventDefault();
          this.toggleNarrator();
          break;
        case 'c':
          e.preventDefault();
          this.setContrast(this.settings.contrast === 'normal' ? 'high' : 'normal');
          break;
        case '1':
          e.preventDefault();
          this.setTextSize('normal');
          break;
        case '2':
          e.preventDefault();
          this.setTextSize('large');
          break;
        case '3':
          e.preventDefault();
          this.setTextSize('xlarge');
          break;
      }
    });
  }

  private applySettings(): void {
    document.documentElement.setAttribute('data-text-size', this.settings.textSize);
    document.documentElement.setAttribute('data-contrast', this.settings.contrast);
    this.syncButtonGroup('text-size', this.settings.textSize);
    this.syncButtonGroup('contrast', this.settings.contrast);
    this.syncNarratorToggle();
    if (this.settings.narrator) this.startNarrator();
  }
}
