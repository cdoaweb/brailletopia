export class BrailleTranslator {
    constructor(outputContainerId, inputId) {
        this.outputContainer = document.getElementById(outputContainerId);
        this.inputElement = document.getElementById(inputId);

        this.map = {
            'a': [1], 'b': [1, 2], 'c': [1, 4], 'd': [1, 4, 5], 'e': [1, 5],
            'f': [1, 2, 4], 'g': [1, 2, 4, 5], 'h': [1, 2, 5], 'i': [2, 4], 'j': [2, 4, 5],
            'k': [1, 3], 'l': [1, 2, 3], 'm': [1, 3, 4], 'n': [1, 3, 4, 5], 'o': [1, 3, 5],
            'p': [1, 2, 3, 4], 'q': [1, 2, 3, 4, 5], 'r': [1, 2, 3, 5], 's': [2, 3, 4], 't': [2, 3, 4, 5],
            'u': [1, 3, 6], 'v': [1, 2, 3, 6], 'w': [2, 4, 5, 6], 'x': [1, 3, 4, 6], 'y': [1, 3, 4, 5, 6], 'z': [1, 3, 5, 6],
            ' ': [], 
            'á': [1, 2, 3, 5, 6], 'é': [2, 3, 4, 6], 'í': [3, 4], 'ó': [3, 4, 6], 'ú': [2, 3, 4, 5, 6],
            'ñ': [1, 2, 4, 5, 6],
            '1': [1], '2': [1, 2], '3': [1, 4], '4': [1, 4, 5], '5': [1, 5], 
            '6': [1, 2, 4], '7': [1, 2, 4, 5], '8': [1, 2, 5], '9': [2, 4], '0': [2, 4, 5]
        };

        this.init();
    }

    init() {
        if (this.inputElement) {
            this.inputElement.addEventListener('input', (e) => {
                this.translate(e.target.value);
            });
            this.inputElement.dispatchEvent(new Event('input'));
        }
    }

    translate(text) {
        this.outputContainer.innerHTML = '';
        this.outputContainer.setAttribute('aria-label', `Traducción a braille de: ${text}`);

        const cleanText = text.toLowerCase().substring(0, 20);

        if (cleanText.length === 0) {
            this.outputContainer.innerHTML = '<p style="color: #666; font-style: italic;">Los puntos mágicos aparecerán aquí...</p>';
            return;
        }

        for (let char of cleanText) {
            const dots = this.map[char];
            this.createBrailleCell(char, dots !== undefined ? dots : []);
        }
    }

    createBrailleCell(char, activeDots) {
        const cell = document.createElement('div');
        cell.className = 'braille-cell-render';
        cell.setAttribute('role', 'img');
        cell.setAttribute('aria-label', `Celda braille para la letra ${char}`);

        for (let i = 1; i <= 6; i++) {
            const dot = document.createElement('div');
            dot.className = activeDots.includes(i) ? 'dot active' : 'dot';
            cell.appendChild(dot);
        }

        const label = document.createElement('span');
        label.className = 'cell-label';
        label.innerText = char;
        cell.appendChild(label);

        this.outputContainer.appendChild(cell);
    }
}
