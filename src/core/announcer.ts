/* ============================================
   BRAILLETOPÍA - ANUNCIOS PARA LECTOR DE PANTALLA
   Región aria-live compartida por toda la aplicación.
   ============================================ */

let pendingTimer: number | undefined;

function getAnnouncer(): HTMLElement {
  let announcer = document.getElementById('sr-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.className = 'sr-announcement';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
  }
  return announcer;
}

export function announce(message: string): void {
  const announcer = getAnnouncer();
  announcer.textContent = '';
  window.clearTimeout(pendingTimer);
  pendingTimer = window.setTimeout(() => {
    announcer.textContent = message;
  }, 100);
}
