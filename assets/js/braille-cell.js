import { soundManager } from './sound-manager.js';

export class BrailleCell {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.dotsState = [false, false, false, false, false, false];
        this.render();
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = '';
        this.container.setAttribute('role', 'group');
        this.container.setAttribute('aria-label', 'Celda braille interactiva de 6 puntos');

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = '1fr 1fr';
        grid.style.gap = '20px';
        grid.style.maxWidth = '200px';
        grid.style.margin = '20px auto';

        const order = [0, 3, 1, 4, 2, 5];

        order.forEach((dotIndex) => {
            const btn = document.createElement('button');
            const dotNum = dotIndex + 1;

            btn.className = 'braille-dot btn-quiz';
            btn.setAttribute('aria-label', `Punto ${dotNum}, desactivado`);
            btn.setAttribute('aria-pressed', 'false');

            btn.style.width = '60px';
            btn.style.height = '60px';
            btn.style.borderRadius = '50%';
            btn.style.border = '4px solid var(--col-primary)';
            btn.style.backgroundColor = '#fff';
            btn.style.cursor = 'pointer';

            btn.addEventListener('click', () => this.toggleDot(dotIndex, btn));
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleDot(dotIndex, btn);
                }
            });

            grid.appendChild(btn);
        });

        this.container.appendChild(grid);

        const result = document.createElement('div');
        result.id = 'braille-output';
        result.className = 'braille-result';
        result.innerHTML = '<p aria-live="polite">Puntos activos: Ninguno</p>';
        result.style.textAlign = 'center';
        result.style.fontSize = '1rem';
        result.style.marginTop = '1rem';
        this.container.appendChild(result);
    }

    toggleDot(index, btn) {
        this.dotsState[index] = !this.dotsState[index];
        const isActive = this.dotsState[index];

        btn.style.backgroundColor = isActive ? 'var(--col-primary)' : '#fff';

        btn.setAttribute('aria-pressed', isActive);
        btn.setAttribute('aria-label', `Punto ${index + 1}, ${isActive ? 'activado' : 'desactivado'}`);

        soundManager.playUxPrimary(isActive);
        this.updateOutput();
    }

    updateOutput() {
        const activeDots = this.dotsState
            .map((state, i) => state ? i + 1 : null)
            .filter(n => n !== null);

        const text = activeDots.length > 0 
            ? `Puntos activos: ${activeDots.join(', ')}`
            : 'Puntos activos: Ninguno';

        document.getElementById('braille-output').innerHTML = `<p aria-live="polite">${text}</p>`;
    }
}
