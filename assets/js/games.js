// assets/js/games.js
// Este módulo define varios minijuegos relacionados con el aprendizaje del braille.
// Cada clase encapsula la lógica y el DOM necesario para su funcionamiento y
// expone una interfaz consistente.  Todos los juegos utilizan sonidos a
// través del SoundManager y generan retroalimentación visual y auditiva.

import { soundManager } from './sound-manager.js';

/**
 * Juego 1: Construye la Letra
 *
 * En este juego se muestra una letra al usuario.  El objetivo es
 * activar en la celda braille los puntos correspondientes a dicha
 * letra.  Al acertar, se incrementa la puntuación y se pasa a una
 * nueva letra.  Está pensado para reforzar la correspondencia entre
 * letras y sus patrones de puntos.
 */
export class BuildLetterGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.score = 0;
        this.currentLetter = null;
        this.dotsState = [false, false, false, false, false, false];
        // Mapa de letras a puntos, basado en el alfabeto braille de 6 puntos.
        this.map = {
            'a': [1], 'b': [1, 2], 'c': [1, 4], 'd': [1, 4, 5], 'e': [1, 5],
            'f': [1, 2, 4], 'g': [1, 2, 4, 5], 'h': [1, 2, 5], 'i': [2, 4], 'j': [2, 4, 5],
            'k': [1, 3], 'l': [1, 2, 3], 'm': [1, 3, 4], 'n': [1, 3, 4, 5], 'o': [1, 3, 5],
            'p': [1, 2, 3, 4], 'q': [1, 2, 3, 4, 5], 'r': [1, 2, 3, 5], 's': [2, 3, 4], 't': [2, 3, 4, 5],
            'u': [1, 3, 6], 'v': [1, 2, 3, 6], 'w': [2, 4, 5, 6], 'x': [1, 3, 4, 6], 'y': [1, 3, 4, 5, 6], 'z': [1, 3, 5, 6]
        };
        this.init();
    }

    init() {
        if (!this.container) return;
        // Renderizado inicial de la interfaz del juego.
        this.container.innerHTML = `
            <div class="game-build-letter">
                <h3 id="build-letter-title">🔧 Construye la letra</h3>
                <p id="build-instruction">Activa los puntos para formar la letra indicada.</p>
                <div style="font-size: 2rem; text-align: center; margin: 0.5rem 0;">
                    Letra objetivo: <span id="target-letter" style="color: var(--col-secondary); font-weight: bold;">A</span>
                </div>
                <div id="build-cell" role="group" aria-label="Celda braille interactiva"></div>
                <div id="build-feedback" class="feedback-msg" aria-live="assertive" style="margin-top:0.5rem;"></div>
                <div aria-live="polite" style="margin-top:0.5rem;">
                    Puntuación: <span id="build-score">0</span>
                </div>
            </div>
        `;
        this.gridEl = this.container.querySelector('#build-cell');
        this.feedbackEl = this.container.querySelector('#build-feedback');
        this.scoreEl = this.container.querySelector('#build-score');
        this.targetLetterEl = this.container.querySelector('#target-letter');
        this.renderCell();
        this.nextRound();
    }

    /**
     * Genera la estructura visual de la celda braille como una cuadricula de
     * seis botones.  Cada botón puede alternarse entre activado y
     * desactivado.  Se asignan descripciones ARIA para los lectores de
     * pantalla.
     */
    renderCell() {
        if (!this.gridEl) return;
        this.gridEl.innerHTML = '';
        this.gridEl.style.display = 'grid';
        this.gridEl.style.gridTemplateColumns = 'repeat(2, 60px)';
        this.gridEl.style.gap = '20px';
        this.gridEl.style.justifyContent = 'center';

        const order = [0, 3, 1, 4, 2, 5];
        this.buttons = [];
        order.forEach((idx) => {
            const dotNum = idx + 1;
            const btn = document.createElement('button');
            btn.className = 'braille-dot btn-quiz';
            btn.setAttribute('aria-label', `Punto ${dotNum}, desactivado`);
            btn.setAttribute('aria-pressed', 'false');
            btn.style.width = '60px';
            btn.style.height = '60px';
            btn.style.borderRadius = '50%';
            btn.style.border = '4px solid var(--col-primary)';
            btn.style.backgroundColor = '#fff';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', () => this.toggleDot(idx, btn));
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleDot(idx, btn);
                }
            });
            this.buttons[idx] = btn;
            this.gridEl.appendChild(btn);
        });
    }

    /**
     * Selecciona una nueva letra aleatoria como objetivo y actualiza la
     * interfaz.  También restablece el estado de los puntos.
     */
    nextRound() {
        const letters = Object.keys(this.map);
        const random = letters[Math.floor(Math.random() * letters.length)];
        this.currentLetter = random;
        this.targetLetterEl.textContent = random.toUpperCase();
        // Reiniciar estado de los puntos
        this.dotsState = [false, false, false, false, false, false];
        this.buttons.forEach((btn, idx) => {
            btn.style.backgroundColor = '#fff';
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('aria-label', `Punto ${idx + 1}, desactivado`);
        });
        this.feedbackEl.textContent = '';
    }

    /**
     * Alterna el estado de un punto concreto al pulsar sobre él.
     * Comprueba después si el patrón activo coincide con el patrón de la
     * letra objetivo.
     */
    toggleDot(index, btn) {
        this.dotsState[index] = !this.dotsState[index];
        const active = this.dotsState[index];
        btn.style.backgroundColor = active ? 'var(--col-primary)' : '#fff';
        btn.setAttribute('aria-pressed', active);
        btn.setAttribute('aria-label', `Punto ${index + 1}, ${active ? 'activado' : 'desactivado'}`);
        soundManager.playUxPrimary(active);
        this.checkAnswer();
    }

    /**
     * Evalúa si el patrón actual coincide exactamente con la combinación
     * requerida.  Si acierta, incrementa la puntuación y avanza a una
     * nueva letra tras una pequeña pausa.  En caso contrario, no hace
     * nada hasta que el usuario complete la celda correctamente.
     */
    checkAnswer() {
        const expected = this.map[this.currentLetter];
        // Ordenar ambos arreglos para comparar sin depender del orden de entrada.
        const current = this.dotsState.map((v, i) => v ? i + 1 : null).filter(v => v !== null).sort();
        const sortedExpected = [...expected].sort();
        if (current.length === sortedExpected.length && current.every((v, i) => v === sortedExpected[i])) {
            // Acierto
            this.score += 10;
            this.scoreEl.textContent = this.score;
            this.feedbackEl.textContent = '¡Correcto!';
            this.feedbackEl.className = 'feedback-msg success';
            soundManager.playUxPrimary(true);
            // Reproducir sonido heroico cada 3 aciertos
            if (this.score > 0 && (this.score / 10) % 3 === 0) {
                soundManager.playHero();
            }
            setTimeout(() => this.nextRound(), 1200);
        }
    }
}

/**
 * Juego 2: Memoria de Pares
 *
 * Este juego presenta cartas con pares consistentes en una letra y su
 * representación braille.  El jugador debe encontrar las parejas
 * destapando dos cartas a la vez.  Se cuentan los intentos y se
 * proporciona retroalimentación cuando se completa el tablero.
 */
export class MemoryGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.pairs = [
            { id: 'a', char: 'A', dots: [1] },
            { id: 'b', char: 'B', dots: [1, 2] },
            { id: 'c', char: 'C', dots: [1, 4] },
            { id: 'd', char: 'D', dots: [1, 4, 5] },
            { id: 'e', char: 'E', dots: [1, 5] },
            { id: 'f', char: 'F', dots: [1, 2, 4] }
        ];
        this.cards = [];
        this.selected = [];
        this.matchedCount = 0;
        this.moves = 0;
        this.init();
    }

    init() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="memory-game">
                <h3>🧠 Memoria Braille</h3>
                <p>Encuentra cada letra y su patrón braille correspondiente.</p>
                <div id="memory-board" class="memory-board" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;justify-items:center;"></div>
                <div style="margin-top:1rem;">
                    Movimientos: <span id="memory-moves">0</span> – Pares encontrados: <span id="memory-found">0</span>/<span id="memory-total">${this.pairs.length}</span>
                </div>
                <div id="memory-feedback" role="alert" aria-live="assertive" style="margin-top:0.5rem;min-height:1.5rem;"></div>
            </div>
        `;
        this.boardEl = this.container.querySelector('#memory-board');
        this.movesEl = this.container.querySelector('#memory-moves');
        this.foundEl = this.container.querySelector('#memory-found');
        this.feedbackEl = this.container.querySelector('#memory-feedback');
        this.generateCards();
    }

    /**
     * Crea un conjunto duplicado de cartas (letra y braille) y las
     * baraja aleatoriamente antes de insertarlas en el tablero.
     */
    generateCards() {
        const cards = [];
        this.pairs.forEach(pair => {
            // Carta con la letra
            cards.push({ id: pair.id, type: 'char', label: pair.char, dots: pair.dots });
            // Carta con el patrón braille
            cards.push({ id: pair.id, type: 'braille', label: pair.char, dots: pair.dots });
        });
        // Mezclar las cartas
        this.cards = cards.sort(() => Math.random() - 0.5);
        this.renderBoard();
    }

    /**
     * Renderiza el tablero como botones accesibles.  Cada carta puede
     * destaparse para mostrar su contenido.  El contenido se define
     * mediante la propiedad `type` de la carta.
     */
    renderBoard() {
        this.boardEl.innerHTML = '';
        this.cards.forEach((card, index) => {
            const btn = document.createElement('button');
            btn.className = 'memory-card';
            btn.style.width = '80px';
            btn.style.height = '100px';
            btn.style.border = '2px solid var(--col-tertiary)';
            btn.style.borderRadius = '12px';
            btn.style.backgroundColor = '#fff';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.fontSize = '1.5rem';
            btn.setAttribute('data-index', index.toString());
            btn.setAttribute('aria-label', 'Carta oculta');
            btn.onclick = () => this.revealCard(btn, card);
            this.boardEl.appendChild(btn);
        });
    }

    /**
     * Lógica para destapar una carta.  Si hay dos cartas destapadas, se
     * comprueba si forman pareja.  De lo contrario se vuelven a tapar
     * automáticamente tras un breve intervalo.
     */
    revealCard(btn, card) {
        // Evitar que se pulse en cartas ya encontradas o en cartas visibles
        if (btn.classList.contains('matched') || this.selected.find(sel => sel.btn === btn)) {
            return;
        }
        // Mostrar contenido
        btn.style.backgroundColor = 'var(--col-secondary)';
        btn.style.borderColor = 'var(--col-primary)';
        btn.style.color = '#000';
        if (card.type === 'char') {
            btn.textContent = card.label;
            btn.setAttribute('aria-label', `Letra ${card.label}`);
        } else {
            // Dibujar patrón braille dentro del botón
            btn.innerHTML = '';
            btn.setAttribute('aria-label', `Patrón de puntos ${card.dots.join(', ')}`);
            const cell = document.createElement('div');
            cell.style.display = 'grid';
            cell.style.gridTemplateColumns = 'repeat(2, 1fr)';
            cell.style.gap = '2px';
            cell.style.width = '40px';
            cell.style.height = '60px';
            for (let i = 1; i <= 6; i++) {
                const dot = document.createElement('div');
                dot.style.width = '12px';
                dot.style.height = '12px';
                dot.style.borderRadius = '50%';
                dot.style.backgroundColor = card.dots.includes(i) ? 'var(--col-primary)' : 'transparent';
                dot.style.border = '1px solid var(--col-primary)';
                cell.appendChild(dot);
            }
            btn.appendChild(cell);
        }
        // Añadir a seleccionados
        this.selected.push({ btn, card });
        soundManager.playUxPrimary(true);
        if (this.selected.length === 2) {
            this.moves++;
            this.movesEl.textContent = this.moves.toString();
            // Deshabilitar temporalmente el tablero
            this.boardEl.style.pointerEvents = 'none';
            const [first, second] = this.selected;
            if (first.card.id === second.card.id) {
                // Pareja encontrada
                this.matchedCount++;
                this.foundEl.textContent = this.matchedCount.toString();
                first.btn.classList.add('matched');
                second.btn.classList.add('matched');
                soundManager.playUxPrimary(true);
                this.selected = [];
                this.boardEl.style.pointerEvents = 'auto';
                // Comprobar si se completó el juego
                if (this.matchedCount === this.pairs.length) {
                    this.feedbackEl.textContent = '¡Felicidades! Has encontrado todas las parejas.';
                    this.feedbackEl.style.color = 'var(--col-success)';
                    soundManager.playHero();
                }
            } else {
                // No coincide, volver a ocultar tras un breve retraso
                setTimeout(() => {
                    this.selected.forEach(({ btn }) => {
                        btn.textContent = '';
                        btn.style.backgroundColor = '#fff';
                        btn.style.borderColor = 'var(--col-tertiary)';
                        btn.setAttribute('aria-label', 'Carta oculta');
                    });
                    this.selected = [];
                    this.boardEl.style.pointerEvents = 'auto';
                }, 1000);
                soundManager.playUxSecondaryError();
            }
        }
    }
}

/**
 * Juego 3: Lectura Rápida
 *
 * Juego contrarreloj en el que el usuario debe identificar la letra que
 * corresponde al patrón braille mostrado.  Se dispone de un tiempo
 * limitado para acertar el mayor número de letras posible.  El juego
 * registra el número de aciertos y muestra el resultado al final.
 */
export class SpeedReadingGame {
    constructor(containerId, duration = 60) {
        this.container = document.getElementById(containerId);
        this.duration = duration; // duración en segundos
        this.map = {
            'a': [1], 'b': [1, 2], 'c': [1, 4], 'd': [1, 4, 5], 'e': [1, 5],
            'f': [1, 2, 4], 'g': [1, 2, 4, 5], 'h': [1, 2, 5], 'i': [2, 4], 'j': [2, 4, 5],
            'k': [1, 3], 'l': [1, 2, 3], 'm': [1, 3, 4], 'n': [1, 3, 4, 5], 'o': [1, 3, 5],
            'p': [1, 2, 3, 4], 'q': [1, 2, 3, 4, 5], 'r': [1, 2, 3, 5], 's': [2, 3, 4], 't': [2, 3, 4, 5],
            'u': [1, 3, 6], 'v': [1, 2, 3, 6], 'w': [2, 4, 5, 6], 'x': [1, 3, 4, 6], 'y': [1, 3, 4, 5, 6], 'z': [1, 3, 5, 6]
        };
        this.score = 0;
        this.timeLeft = duration;
        this.intervalId = null;
        this.currentLetter = null;
        this.init();
    }

    init() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="speed-reading-game">
                <h3>⏱️ Lectura Rápida</h3>
                <p>Identifica la letra correspondiente al patrón braille antes de que se agote el tiempo.</p>
                <div id="speed-timer" style="font-size:1.5rem; margin-bottom:0.5rem;">Tiempo: ${this.duration}s</div>
                <div id="speed-cell" role="img" aria-label="Patrón braille" style="display:flex;justify-content:center;margin:1rem 0;"></div>
                <div>
                    <label for="speed-input">Tu respuesta:</label>
                    <input id="speed-input" type="text" maxlength="1" style="width:60px; font-size:1.5rem; text-align:center;" aria-label="Introduce la letra correspondiente" disabled>
                    <button id="speed-start" class="btn btn-primary" style="margin-left:10px;">Comenzar</button>
                </div>
                <div aria-live="polite" style="margin-top:0.5rem;">Aciertos: <span id="speed-score">0</span></div>
                <div id="speed-feedback" role="alert" aria-live="assertive" style="margin-top:0.5rem; min-height:1.5rem;"></div>
            </div>
        `;
        this.timerEl = this.container.querySelector('#speed-timer');
        this.cellEl = this.container.querySelector('#speed-cell');
        this.inputEl = this.container.querySelector('#speed-input');
        this.startBtn = this.container.querySelector('#speed-start');
        this.scoreEl = this.container.querySelector('#speed-score');
        this.feedbackEl = this.container.querySelector('#speed-feedback');
        this.startBtn.addEventListener('click', () => this.startGame());
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                this.checkAnswer(e.key.toLowerCase());
            }
        });
    }

    /**
     * Inicia la cuenta atrás y habilita el campo de entrada.  Genera el
     * primer patrón de puntos y actualiza el temporizador cada segundo.
     */
    startGame() {
        this.score = 0;
        this.timeLeft = this.duration;
        this.scoreEl.textContent = '0';
        this.feedbackEl.textContent = '';
        this.inputEl.value = '';
        this.inputEl.disabled = false;
        this.inputEl.focus();
        this.startBtn.disabled = true;
        this.generatePattern();
        this.updateTimer();
        this.intervalId = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    /**
     * Actualiza el texto del temporizador en pantalla.
     */
    updateTimer() {
        this.timerEl.textContent = `Tiempo: ${this.timeLeft}s`;
    }

    /**
     * Finaliza la partida, deshabilitando los controles y mostrando
     * un mensaje de finalización.  Reproduce un sonido heroico al
     * concluir.
     */
    endGame() {
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.inputEl.disabled = true;
        this.startBtn.disabled = false;
        this.cellEl.innerHTML = '';
        this.feedbackEl.textContent = `Juego finalizado. Has acertado ${this.score} letra${this.score === 1 ? '' : 's'}.`;
        this.feedbackEl.style.color = 'var(--col-primary)';
        soundManager.playHero();
    }

    /**
     * Genera un nuevo patrón braille al azar y lo muestra en el
     * contenedor de la celda.
     */
    generatePattern() {
        const letters = Object.keys(this.map);
        const random = letters[Math.floor(Math.random() * letters.length)];
        this.currentLetter = random;
        // Renderizar puntos
        this.cellEl.innerHTML = '';
        const cell = document.createElement('div');
        cell.style.display = 'grid';
        cell.style.gridTemplateColumns = 'repeat(2, 1fr)';
        cell.style.gap = '8px';
        cell.style.width = '80px';
        cell.style.height = '120px';
        for (let i = 1; i <= 6; i++) {
            const dot = document.createElement('div');
            dot.style.width = '20px';
            dot.style.height = '20px';
            dot.style.borderRadius = '50%';
            dot.style.border = '2px solid var(--col-primary)';
            dot.style.backgroundColor = this.map[random].includes(i) ? 'var(--col-primary)' : '#fff';
            cell.appendChild(dot);
        }
        this.cellEl.appendChild(cell);
        this.inputEl.value = '';
    }

    /**
     * Comprueba la respuesta del usuario contra la letra actual.  Si
     * acierta, incrementa el contador y genera un nuevo patrón.  Si
     * falla, se reproduce un sonido de error.
     */
    checkAnswer(letter) {
        if (!this.currentLetter) return;
        if (letter === this.currentLetter) {
            this.score++;
            this.scoreEl.textContent = this.score.toString();
            this.feedbackEl.textContent = '¡Correcto!';
            this.feedbackEl.style.color = 'var(--col-success)';
            soundManager.playUxPrimary(true);
            this.generatePattern();
        } else {
            this.feedbackEl.textContent = `Incorrecto. Era ${this.currentLetter.toUpperCase()}.`;
            this.feedbackEl.style.color = 'var(--col-error)';
            soundManager.playUxSecondaryError();
            this.generatePattern();
        }
    }
}

/**
 * Juego 4: Adivina la Palabra (Hangman Braille)
 *
 * Este juego elige una palabra al azar de una lista y la presenta oculta
 * mediante guiones bajos.  El usuario debe adivinar las letras una a una.
 * Cuando una letra es correcta, se revela en todas las posiciones de la
 * palabra junto con su representación braille.  El jugador dispone de
 * un número limitado de intentos.  Al completar la palabra, se muestra
 * un mensaje de victoria; si se agotan los intentos, se muestra la
 * palabra completa.  Se utilizan sonidos accesibles para reforzar el
 * feedback positivo y negativo.
 */
export class GuessWordGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        // Lista de palabras (en minúsculas) de 3 a 6 letras, relacionadas con braille o conceptos básicos.
        this.words = ['sol', 'luz', 'punto', 'braille', 'gato', 'perro', 'casa', 'silla'];
        // Mapa de letras a puntos braille (6 puntos), reutilizado de otros juegos.
        this.map = {
            'a': [1], 'b': [1, 2], 'c': [1, 4], 'd': [1, 4, 5], 'e': [1, 5],
            'f': [1, 2, 4], 'g': [1, 2, 4, 5], 'h': [1, 2, 5], 'i': [2, 4], 'j': [2, 4, 5],
            'k': [1, 3], 'l': [1, 2, 3], 'm': [1, 3, 4], 'n': [1, 3, 4, 5], 'o': [1, 3, 5],
            'p': [1, 2, 3, 4], 'q': [1, 2, 3, 4, 5], 'r': [1, 2, 3, 5], 's': [2, 3, 4], 't': [2, 3, 4, 5],
            'u': [1, 3, 6], 'v': [1, 2, 3, 6], 'w': [2, 4, 5, 6], 'x': [1, 3, 4, 6], 'y': [1, 3, 4, 5, 6], 'z': [1, 3, 5, 6]
        };
        // Preparar estado inicial
        this.resetGame();
        this.init();
    }

    /**
     * Inicializa la interfaz de juego, creando el DOM necesario y
     * configurando el evento para adivinar letras.  Al cargar la
     * página se genera una palabra nueva.
     */
    init() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="guess-word-game">
                <h3>🎩 Adivina la Palabra</h3>
                <p>Adivina la palabra letra por letra. Cada acierto revela la letra y su patrón braille.</p>
                <div id="gw-word" style="font-size:1.8rem; letter-spacing:0.5rem; margin:1rem 0;"></div>
                <div id="gw-braille" style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:0.5rem;" aria-label="Representaciones en braille"></div>
                <div style="margin: 0.5rem 0;">Intentos restantes: <span id="gw-attempts"></span></div>
                <div>Ya has dicho: <span id="gw-guessed"></span></div>
                <div style="margin-top:1rem; display:flex; align-items:center; gap:10px;">
                    <label for="gw-input">Tu letra:</label>
                    <input id="gw-input" type="text" maxlength="1" style="width:60px; font-size:1.5rem; text-align:center;" aria-label="Introduce una letra" />
                    <button id="gw-guess-btn" class="btn btn-primary">Adivinar</button>
                </div>
                <div id="gw-feedback" aria-live="assertive" style="margin-top:1rem; min-height:1.5rem;"></div>
                <button id="gw-restart" class="btn btn-secondary" style="margin-top:1rem; display:none;">Jugar de nuevo</button>
            </div>
        `;
        this.wordEl = this.container.querySelector('#gw-word');
        this.brailleEl = this.container.querySelector('#gw-braille');
        this.attemptsEl = this.container.querySelector('#gw-attempts');
        this.guessedEl = this.container.querySelector('#gw-guessed');
        this.inputEl = this.container.querySelector('#gw-input');
        this.guessBtn = this.container.querySelector('#gw-guess-btn');
        this.feedbackEl = this.container.querySelector('#gw-feedback');
        this.restartBtn = this.container.querySelector('#gw-restart');
        this.guessBtn.addEventListener('click', () => {
            const val = this.inputEl.value.trim().toLowerCase();
            if (val && /^[a-zñáéíóúü]$/i.test(val)) {
                this.guessLetter(val);
            }
            this.inputEl.value = '';
            this.inputEl.focus();
        });
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.guessBtn.click();
            }
        });
        this.restartBtn.addEventListener('click', () => this.startNewWord());
        // Iniciar primer juego seleccionando palabra
        this.startNewWord();
    }

    /**
     * Restaura el estado interno del juego y selecciona una nueva palabra.
     */
    /**
     * Resetea contadores y estructuras sin seleccionar una nueva palabra.
     */
    resetGame() {
        this.guessedLetters = new Set();
        this.remainingAttempts = 6;
        this.currentWord = '';
    }

    /**
     * Selecciona una nueva palabra, reinicia el estado y actualiza la
     * interfaz para comenzar una nueva partida.
     */
    startNewWord() {
        this.resetGame();
        // Seleccionar palabra al azar
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        this.feedbackEl.textContent = '';
        this.restartBtn.style.display = 'none';
        this.guessBtn.disabled = false;
        this.inputEl.disabled = false;
        this.updateDisplay();
    }

    /**
     * Actualiza la vista de la palabra oculta, las representaciones
     * braille visibles y los contadores de intentos y letras usadas.
     */
    updateDisplay() {
        let display = '';
        this.brailleEl.innerHTML = '';
        for (const ch of this.currentWord) {
            if (this.guessedLetters.has(ch)) {
                display += ch.toUpperCase() + ' ';
                const cell = this.createBrailleCell(this.map[ch]);
                this.brailleEl.appendChild(cell);
            } else {
                display += '_ ';
                const placeholder = document.createElement('div');
                placeholder.style.width = '48px';
                placeholder.style.height = '70px';
                this.brailleEl.appendChild(placeholder);
            }
        }
        this.wordEl.textContent = display.trim();
        this.attemptsEl.textContent = this.remainingAttempts.toString();
        this.guessedEl.textContent = Array.from(this.guessedLetters).join(', ').toUpperCase();
    }

    /**
     * Crea un elemento DOM representando una celda braille de 2x3
     * con puntos activos.
     * @param {number[]} dots
     */
    createBrailleCell(dots) {
        const cell = document.createElement('div');
        cell.style.display = 'grid';
        cell.style.gridTemplateColumns = 'repeat(2, 1fr)';
        cell.style.gap = '4px';
        cell.style.width = '48px';
        cell.style.height = '70px';
        for (let i = 1; i <= 6; i++) {
            const dot = document.createElement('div');
            dot.style.width = '14px';
            dot.style.height = '14px';
            dot.style.borderRadius = '50%';
            dot.style.border = '1px solid var(--col-primary)';
            dot.style.backgroundColor = dots.includes(i) ? 'var(--col-primary)' : '#fff';
            cell.appendChild(dot);
        }
        return cell;
    }

    /**
     * Gestiona una letra introducida por el usuario, actualizando el
     * conjunto de letras adivinadas y los intentos restantes.
     * @param {string} letter
     */
    guessLetter(letter) {
        if (!this.currentWord) return;
        const normalized = letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const ch = normalized[0];
        if (this.guessedLetters.has(ch) || !/[a-z]/.test(ch)) {
            return;
        }
        this.guessedLetters.add(ch);
        if (this.currentWord.includes(ch)) {
            soundManager.playUxPrimary(true);
            this.updateDisplay();
            if (this.currentWord.split('').every(c => this.guessedLetters.has(c))) {
                this.feedbackEl.textContent = '¡Enhorabuena! Has descubierto la palabra.';
                this.feedbackEl.style.color = 'var(--col-success)';
                soundManager.playHero();
                this.endGame();
            }
        } else {
            this.remainingAttempts--;
            soundManager.playUxSecondaryError();
            this.updateDisplay();
            if (this.remainingAttempts <= 0) {
                this.feedbackEl.textContent = `Has perdido. La palabra era ${this.currentWord.toUpperCase()}.`;
                this.feedbackEl.style.color = 'var(--col-error)';
                this.endGame();
            }
        }
    }

    /**
     * Finaliza la partida deshabilitando controles y mostrando el
     * botón para iniciar una nueva.
     */
    endGame() {
        this.guessBtn.disabled = true;
        this.inputEl.disabled = true;
        this.restartBtn.style.display = 'inline-block';
    }
}

/**
 * Juego 5: Secuencia Memoria (Simón Braille)
 *
 * Este juego es una variación del clásico "Simón dice" adaptado a
 * patrones braille.  El sistema genera una secuencia de letras
 * aleatorias.  En cada ronda, se añade una letra más a la secuencia
 * y se muestra visualmente con patrones braille y una pausa entre
 * cada una.  El jugador debe repetir la secuencia escribiendo las
 * letras en el orden correcto.  Si acierta, la secuencia aumenta;
 * si falla, el juego termina mostrando el nivel alcanzado.  Se
 * utilizan sonidos para indicar la reproducción de la secuencia y
 * para proporcionar feedback en aciertos o errores.
 */
export class SequenceMemoryGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.map = {
            'a': [1], 'b': [1, 2], 'c': [1, 4], 'd': [1, 4, 5], 'e': [1, 5],
            'f': [1, 2, 4], 'g': [1, 2, 4, 5], 'h': [1, 2, 5], 'i': [2, 4], 'j': [2, 4, 5],
            'k': [1, 3], 'l': [1, 2, 3], 'm': [1, 3, 4], 'n': [1, 3, 4, 5], 'o': [1, 3, 5],
            'p': [1, 2, 3, 4], 'q': [1, 2, 3, 4, 5], 'r': [1, 2, 3, 5], 's': [2, 3, 4], 't': [2, 3, 4, 5],
            'u': [1, 3, 6], 'v': [1, 2, 3, 6], 'w': [2, 4, 5, 6], 'x': [1, 3, 4, 6], 'y': [1, 3, 4, 5, 6], 'z': [1, 3, 5, 6]
        };
        this.sequence = [];
        this.init();
    }

    init() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="sequence-memory-game">
                <h3>🔁 Secuencia de Memoria</h3>
                <p>Observa la secuencia de patrones braille y repítela escribiendo las letras en orden.</p>
                <button id="seq-start" class="btn btn-primary">Comenzar</button>
                <div id="seq-board" style="display:flex; gap:12px; justify-content:center; margin:1rem 0; min-height:80px;" aria-label="Secuencia de patrones"></div>
                <div id="seq-status" style="margin-bottom:1rem;">Ronda: 0</div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <label for="seq-input">Tu secuencia:</label>
                    <input id="seq-input" type="text" style="flex:1; font-size:1.5rem;" aria-label="Introduce la secuencia de letras" disabled>
                    <button id="seq-submit" class="btn btn-secondary" disabled>Enviar</button>
                </div>
                <div id="seq-feedback" aria-live="assertive" style="margin-top:1rem; min-height:1.5rem;"></div>
            </div>
        `;
        this.startBtn = this.container.querySelector('#seq-start');
        this.boardEl = this.container.querySelector('#seq-board');
        this.statusEl = this.container.querySelector('#seq-status');
        this.inputEl = this.container.querySelector('#seq-input');
        this.submitBtn = this.container.querySelector('#seq-submit');
        this.feedbackEl = this.container.querySelector('#seq-feedback');
        this.startBtn.addEventListener('click', () => this.startGame());
        this.submitBtn.addEventListener('click', () => this.checkSequence());
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!this.submitBtn.disabled) this.checkSequence();
            }
        });
    }

    startGame() {
        this.sequence = [];
        this.statusEl.textContent = 'Ronda: 0';
        this.feedbackEl.textContent = '';
        this.startBtn.disabled = true;
        this.inputEl.value = '';
        this.inputEl.disabled = true;
        this.submitBtn.disabled = true;
        this.nextRound();
    }

    async nextRound() {
        const letters = Object.keys(this.map);
        this.sequence.push(letters[Math.floor(Math.random() * letters.length)]);
        const round = this.sequence.length;
        this.statusEl.textContent = `Ronda: ${round}`;
        await this.showSequence();
        this.inputEl.value = '';
        this.inputEl.disabled = false;
        this.submitBtn.disabled = false;
        this.inputEl.focus();
    }

    async showSequence() {
        this.inputEl.disabled = true;
        this.submitBtn.disabled = true;
        this.boardEl.innerHTML = '';
        const cells = this.sequence.map(letter => this.createBrailleCell(this.map[letter]));
        cells.forEach(cell => {
            cell.style.opacity = '0.3';
            this.boardEl.appendChild(cell);
        });
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            cell.style.opacity = '1';
            soundManager.playUxPrimary(true);
            await this.sleep(600);
            cell.style.opacity = '0.3';
            await this.sleep(200);
        }
        this.boardEl.innerHTML = '';
        cells.forEach(cell => this.boardEl.appendChild(cell));
    }

    checkSequence() {
        const input = this.inputEl.value.trim().toLowerCase();
        if (!input) return;
        if (input === this.sequence.join('')) {
            this.feedbackEl.textContent = '¡Bien! Prepárate para la siguiente ronda.';
            this.feedbackEl.style.color = 'var(--col-success)';
            soundManager.playUxPrimary(true);
            this.inputEl.disabled = true;
            this.submitBtn.disabled = true;
            setTimeout(() => this.nextRound(), 1000);
        } else {
            this.feedbackEl.textContent = `Te has equivocado. Lograste una secuencia de ${this.sequence.length - 1} letra${this.sequence.length - 1 === 1 ? '' : 's'}.`;
            this.feedbackEl.style.color = 'var(--col-error)';
            soundManager.playUxSecondaryError();
            this.endGame();
        }
    }

    endGame() {
        this.startBtn.disabled = false;
        this.inputEl.disabled = true;
        this.submitBtn.disabled = true;
    }

    createBrailleCell(dots) {
        const cell = document.createElement('div');
        cell.style.display = 'grid';
        cell.style.gridTemplateColumns = 'repeat(2, 1fr)';
        cell.style.gap = '4px';
        cell.style.width = '48px';
        cell.style.height = '70px';
        for (let i = 1; i <= 6; i++) {
            const dot = document.createElement('div');
            dot.style.width = '14px';
            dot.style.height = '14px';
            dot.style.borderRadius = '50%';
            dot.style.border = '1px solid var(--col-primary)';
            dot.style.backgroundColor = dots.includes(i) ? 'var(--col-primary)' : '#fff';
            cell.appendChild(dot);
        }
        return cell;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}