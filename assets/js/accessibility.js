import { soundManager } from './sound-manager.js';

export class AccessibilityManager {
    constructor() {
        this.body = document.body;
        this.fontSize = 100;
        this.synth = window.speechSynthesis;
        this.baseFontSize = 16;
        this.narratorOn = localStorage.getItem('narrator_on') !== 'false';
        this.init();
    }

    init() {
        this.setupControls();
        this.checkPreferences();
    }

    setupControls() {
        const btnContrast = document.getElementById('btn-contrast');
        const btnIncrease = document.getElementById('btn-inc-text');
        const btnNarrator = document.getElementById('btn-narrator');

        if (btnContrast) {
            btnContrast.addEventListener('click', () => {
                this.toggleContrast();
                soundManager.playToggle();
            });
        }

        if (btnIncrease) {
            btnIncrease.addEventListener('click', () => {
                this.resizeText();
                soundManager.playUxPrimary(true);
            });
        }

        if (btnNarrator) {
            btnNarrator.addEventListener('click', () => this.toggleNarrator());
        }
    }

    toggleContrast() {
        this.body.classList.toggle('high-contrast');
        const isHigh = this.body.classList.contains('high-contrast');
        localStorage.setItem('contrast', isHigh ? 'high' : 'normal');
        this.announce(`Modo alto contraste ${isHigh ? 'activado' : 'desactivado'}`);
    }

    resizeText() {
        this.fontSize = (this.fontSize >= 150) ? 100 : this.fontSize + 10;
        document.documentElement.style.setProperty('--text-base', `${this.baseFontSize * (this.fontSize/100)}px`);
        localStorage.setItem('font_size', this.fontSize);
        this.announce(`Tamaño de texto al ${this.fontSize} por ciento`);
    }

    toggleNarrator() {
        this.narratorOn = !this.narratorOn;
        localStorage.setItem('narrator_on', this.narratorOn);
        const msg = this.narratorOn ? 'Narrador activado.' : 'Narrador desactivado.';
        this.announce(msg);
        soundManager.playToggle();
        if (this.narratorOn) {
            this.readPage();
        }
    }

    announce(text) {
        if (!this.narratorOn || !this.synth) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        this.synth.cancel();
        this.synth.speak(utterance);
    }

    readPage() {
        if (!this.narratorOn) return;
        const main = document.querySelector('main');
        if (!main) return;
        const mainContent = main.innerText;
        const snippet = mainContent.substring(0, 400);
        this.announce(`Contenido principal: ${snippet}...`);
    }

    checkPreferences() {
        if (localStorage.getItem('contrast') === 'high') {
            this.body.classList.add('high-contrast');
        }
        const savedSize = parseInt(localStorage.getItem('font_size'));
        if (savedSize && savedSize !== 100) {
            this.fontSize = savedSize;
            document.documentElement.style.setProperty('--text-base', `${this.baseFontSize * (this.fontSize/100)}px`);
        }
        this.narratorOn = localStorage.getItem('narrator_on') !== 'false';
    }
}
