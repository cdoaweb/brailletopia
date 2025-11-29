import { soundManager } from './sound-manager.js';

export class BrailleQuiz {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.score = 0;
        this.streak = 0;
        this.currentLetter = null;

        this.levelOne = [
            { char: 'a', dots: [1] }, { char: 'b', dots: [1, 2] }, { char: 'c', dots: [1, 4] }, 
            { char: 'd', dots: [1, 4, 5] }, { char: 'e', dots: [1, 5] }, { char: 'f', dots: [1, 2, 4] }, 
            { char: 'g', dots: [1, 2, 4, 5] }, { char: 'h', dots: [1, 2, 5] }, { char: 'i', dots: [2, 4] }, 
            { char: 'j', dots: [2, 4, 5] }
        ];

        this.init();
    }

    init() {
        this.renderInterface();
        this.nextQuestion();
    }

    renderInterface() {
        this.container.innerHTML = `
            <div class="quiz-header">
                <div class="score-badge" aria-live="polite">⭐ Puntos: <span id="score-val">0</span></div>
            </div>

            <div class="quiz-board">
                <div id="question-cell" class="braille-display-lg" role="img"></div>
                <p class="instruction-text">¿Qué letra ves arriba?</p>
            </div>

            <div id="options-grid" class="options-grid"></div>

            <div id="visual-feedback" class="feedback-msg" aria-live="assertive"></div>
        `;
    }

    nextQuestion() {
        const level = parseInt(localStorage.getItem('braille_level') || '1');
        const availableLetters = this.levelOne.slice(0, level * 2 + 5);

        const randomIndex = Math.floor(Math.random() * availableLetters.length);
        const target = availableLetters[randomIndex];
        this.currentLetter = target;

        this.drawCell(target.dots);

        const options = this.generateOptions(target, availableLetters);
        this.renderOptions(options);

        const visualFeedback = document.getElementById('visual-feedback');
        visualFeedback.className = 'feedback-msg';
        visualFeedback.innerText = '';

        const questionCell = document.getElementById('question-cell');
        if (questionCell) questionCell.focus();
    }

    drawCell(activeDots) {
        const cell = document.getElementById('question-cell');
        cell.innerHTML = '';
        cell.setAttribute('tabindex', '0');

        for (let i = 1; i <= 6; i++) {
            const dot = document.createElement('div');
            dot.className = activeDots.includes(i) ? 'dot active' : 'dot';
            cell.appendChild(dot);
        }

        const dotText = activeDots.length > 0 ? activeDots.join(', ') : 'Ninguno';
        cell.setAttribute('aria-label', `Pregunta: Adivina la letra formada por los puntos ${dotText}`);
    }

    generateOptions(target, availableLetters) {
        let options = [target];
        const usedChars = new Set([target.char]);

        while (options.length < 3) {
            const random = availableLetters[Math.floor(Math.random() * availableLetters.length)];
            if (!usedChars.has(random.char)) {
                options.push(random);
                usedChars.add(random.char);
            }
        }
        return options.sort(() => Math.random() - 0.5);
    }

    renderOptions(options) {
        const grid = document.getElementById('options-grid');
        grid.innerHTML = '';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-quiz';
            btn.innerText = opt.char.toUpperCase();
            btn.setAttribute('aria-label', `Opción: Letra ${opt.char.toUpperCase()}`);
            btn.onclick = () => this.checkAnswer(opt);
            grid.appendChild(btn);
        });
    }

    checkAnswer(selected) {
        const isCorrect = selected.char === this.currentLetter.char;
        const visualFeedback = document.getElementById('visual-feedback');

        if (isCorrect) {
            this.score += 10;
            this.streak++;
            document.getElementById('score-val').innerText = this.score;

            visualFeedback.innerText = "¡SÍ! 🎉 ¡Correcto!";
            visualFeedback.className = "feedback-msg success";

            soundManager.playUxPrimary(true);

            if (this.streak > 0 && this.streak % 5 === 0) {
                soundManager.playHero();
            }

            setTimeout(() => this.nextQuestion(), 1500);
        } else {
            this.streak = 0;
            visualFeedback.innerText = `Incorrecto. La respuesta correcta es ${this.currentLetter.char.toUpperCase()}.`;
            visualFeedback.className = "feedback-msg error";

            soundManager.playUxSecondaryError();

            setTimeout(() => this.nextQuestion(), 2000);
        }

        localStorage.setItem(
            'total_score',
            (parseInt(localStorage.getItem('total_score') || 0) + (isCorrect ? 1 : 0))
        );
        localStorage.setItem(
            'total_attempts',
            (parseInt(localStorage.getItem('total_attempts') || 0) + 1)
        );
    }
}
