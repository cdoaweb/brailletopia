import { initPage } from '../core/page';

const manager = initPage('home');

window.setTimeout(() => {
  manager.announce('Bienvenido a Brailletopía. Usa Alt + A para abrir el panel de accesibilidad.');
}, 1000);
