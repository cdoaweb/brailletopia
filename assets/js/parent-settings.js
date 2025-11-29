import { soundManager } from './sound-manager.js';

export class ParentSettings {
    constructor() {
        this.gate = document.getElementById('security-gate');
        this.settingsContent = document.getElementById('settings-content');
        this.mathProblemEl = document.getElementById('math-problem');
        this.answerInput = document.getElementById('math-answer');
        this.verifyBtn = document.getElementById('verify-btn');
        this.feedbackEl = document.getElementById('auth-feedback');
        this.saveBtn = document.getElementById('save-settings');

        this.correctAnswer = 0;
        this.init();
    }

    init() {
        this.generateProblem();
        this.verifyBtn.addEventListener('click', () => this.verifyAnswer());
        this.answerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.verifyAnswer();
            }
        });
        this.saveBtn.addEventListener('click', () => this.saveSettings());
    }

    generateProblem() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        this.correctAnswer = num1 + num2;

        this.mathProblemEl.innerText = `${num1} + ${num2} = ?`;
        this.answerInput.value = '';
        this.answerInput.focus();
    }

    verifyAnswer() {
        const userAnswer = parseInt(this.answerInput.value.trim());

        if (userAnswer === this.correctAnswer) {
            this.feedbackEl.innerText = "Acceso concedido. Cargando ajustes...";
            this.feedbackEl.style.color = 'var(--col-success)';
            this.openSettings();
        } else {
            this.feedbackEl.innerText = "Respuesta incorrecta. Inténtalo de nuevo.";
            this.feedbackEl.style.color = 'var(--col-error)';
            this.generateProblem();
        }
    }

    openSettings() {
        this.gate.style.display = 'none';
        this.settingsContent.style.display = 'block';
        this.loadCurrentSettings();
        this.loadProgressData();

        const soundsOn = localStorage.getItem('sounds_on') !== 'false';
        soundManager.setSoundsOn(soundsOn);
    }

    loadCurrentSettings() {
        const savedLevel = localStorage.getItem('braille_level') || '1';
        document.getElementById('level-select').value = savedLevel;

        document.getElementById('narrator-toggle').checked = localStorage.getItem('narrator_on') !== 'false';
        document.getElementById('sounds-toggle').checked = localStorage.getItem('sounds_on') !== 'false';
    }

    loadProgressData() {
        const totalScore = parseInt(localStorage.getItem('total_score') || 0);
        const totalAttempts = parseInt(localStorage.getItem('total_attempts') || 0);
        let currentLevelText = "Principiante";
        let successRate = 0;

        if (totalAttempts > 0) {
            successRate = Math.round((totalScore / totalAttempts) * 100);
        }

        const currentLevel = parseInt(localStorage.getItem('braille_level') || '1');
        if (currentLevel === 2) currentLevelText = "Intermedio";
        if (currentLevel === 3) currentLevelText = "Avanzado";

        document.getElementById('current-level').innerText = currentLevelText;
        document.getElementById('success-rate').innerText = `${successRate}%`;
    }

    saveSettings() {
        const selectedLevel = document.getElementById('level-select').value;
        const narratorOn = document.getElementById('narrator-toggle').checked;
        const soundsOn = document.getElementById('sounds-toggle').checked;

        localStorage.setItem('braille_level', selectedLevel);
        localStorage.setItem('narrator_on', narratorOn);
        localStorage.setItem('sounds_on', soundsOn);

        soundManager.setSoundsOn(soundsOn);

        alert("Ajustes guardados correctamente.");
        this.loadProgressData();
    }
}
