/* ============================================
   BRAILLETOPÍA - LAYOUT COMPARTIDO
   Header, footer, panel de accesibilidad y breadcrumbs se
   renderizan de forma síncrona desde TypeScript: sin fetch,
   sin condiciones de carrera y con una única fuente de verdad.
   ============================================ */

import { getSession, logout } from '../core/auth';
import { announce } from '../core/announcer';

export type PageId = 'home' | 'cursos' | 'juegos' | 'contacto' | 'login' | 'legales';

/** Prefijo relativo hacia la raíz del sitio según la página actual. */
function basePath(): string {
  return window.location.pathname.includes('/pages/') ? '../' : './';
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderHeader(activePage: PageId): void {
  const container = document.getElementById('header-container');
  if (!container) return;

  const base = basePath();
  const session = getSession();

  const navItems: Array<{ page: PageId; href: string; label: string }> = [
    { page: 'home', href: `${base}index.html`, label: 'Inicio' },
    { page: 'cursos', href: `${base}pages/cursos.html`, label: 'Cursos' },
    { page: 'juegos', href: `${base}pages/juegos.html`, label: 'Juegos' },
    { page: 'contacto', href: `${base}pages/contacto.html`, label: 'Contacto' },
  ];

  const sessionArea = session
    ? `
      <div class="header-session" style="display: flex; align-items: center; gap: var(--space-sm);">
        <span aria-hidden="true">👤</span>
        <span>Hola, <strong>${escapeHtml(session.name)}</strong></span>
        <button id="logout-btn" class="btn btn-outline" aria-label="Cerrar sesión">Cerrar Sesión</button>
      </div>`
    : `
      <a href="${base}pages/login.html" class="btn btn-primary" aria-label="Iniciar sesión">
        Iniciar Sesión
      </a>`;

  container.innerHTML = `
    <header class="site-header" role="banner">
      <div class="container">
        <div class="header-container">
          <a href="${base}index.html" class="site-logo" aria-label="Brailletopía - Página principal">
            <span aria-hidden="true">⠃⠗⠇</span>
            <span>Brailletopía</span>
          </a>

          <nav class="main-nav" aria-label="Navegación principal">
            <ul class="nav-list">
              ${navItems
                .map(
                  (item) => `
                <li>
                  <a href="${item.href}"
                     class="nav-link${item.page === activePage ? ' active' : ''}"
                     ${item.page === activePage ? 'aria-current="page"' : ''}>
                    ${item.label}
                  </a>
                </li>`,
                )
                .join('')}
            </ul>
          </nav>

          ${sessionArea}
        </div>
      </div>
    </header>
  `;

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logout();
    announce('Sesión cerrada');
    window.location.href = `${base}index.html`;
  });
}

function renderFooter(): void {
  const container = document.getElementById('footer-container');
  if (!container) return;

  const base = basePath();
  container.innerHTML = `
    <footer class="site-footer" role="contentinfo">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-section">
            <h3>Brailletopía</h3>
            <p>
              Plataforma educativa accesible para el aprendizaje del sistema braille.
              Diseñada con amor para estudiantes con discapacidad visual.
            </p>
          </div>

          <div class="footer-section">
            <h3>Enlaces Rápidos</h3>
            <nav aria-label="Enlaces del footer">
              <a href="${base}index.html" class="footer-link">Inicio</a>
              <a href="${base}pages/cursos.html" class="footer-link">Cursos</a>
              <a href="${base}pages/juegos.html" class="footer-link">Juegos</a>
              <a href="${base}pages/contacto.html" class="footer-link">Contacto</a>
            </nav>
          </div>

          <div class="footer-section">
            <h3>Información Legal</h3>
            <nav aria-label="Enlaces legales">
              <a href="${base}pages/legales.html" class="footer-link">Términos y Condiciones</a>
              <a href="${base}pages/legales.html#privacidad" class="footer-link">Política de Privacidad</a>
              <a href="${base}pages/legales.html#accesibilidad" class="footer-link">Declaración de Accesibilidad</a>
            </nav>
          </div>

          <div class="footer-section">
            <h3>Accesibilidad</h3>
            <p>
              Esta plataforma cumple con las pautas WCAG 2.1 nivel AA.
              Estamos comprometidos con la accesibilidad digital.
            </p>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} Brailletopía. Todos los derechos reservados. Diseñado para el aprendizaje inclusivo.</p>
        </div>
      </div>
    </footer>
  `;
}

function renderAccessibilityPanel(): void {
  const container = document.getElementById('accessibility-container');
  if (!container) return;

  container.innerHTML = `
    <button
      id="accessibility-toggle"
      class="accessibility-toggle"
      aria-label="Abrir panel de accesibilidad"
      aria-expanded="false"
      aria-controls="accessibility-panel"
    >
      ♿
    </button>

    <aside id="accessibility-panel" class="accessibility-panel" role="complementary" aria-label="Panel de controles de accesibilidad">
      <div class="accessibility-panel-header">
        <h2 class="accessibility-panel-title">Accesibilidad</h2>
        <button id="accessibility-close" class="accessibility-close" aria-label="Cerrar panel de accesibilidad">✕</button>
      </div>

      <div class="accessibility-control">
        <label class="accessibility-control-label">Tamaño de texto</label>
        <div class="accessibility-buttons">
          <button class="accessibility-btn active" data-text-size="normal" aria-pressed="true">Normal</button>
          <button class="accessibility-btn" data-text-size="large" aria-pressed="false">Grande</button>
          <button class="accessibility-btn" data-text-size="xlarge" aria-pressed="false">XL</button>
        </div>
      </div>

      <div class="accessibility-control">
        <label class="accessibility-control-label">Contraste</label>
        <div class="accessibility-buttons">
          <button class="accessibility-btn active" data-contrast="normal" aria-pressed="true">Normal</button>
          <button class="accessibility-btn" data-contrast="high" aria-pressed="false">Alto</button>
        </div>
      </div>

      <div class="accessibility-control">
        <label class="accessibility-control-label" for="narrator-toggle">Narrador de pantalla</label>
        <button
          id="narrator-toggle"
          class="toggle-switch"
          role="switch"
          aria-checked="false"
          aria-label="Activar o desactivar narrador"
        ></button>
      </div>

      <div class="accessibility-control" style="margin-top: var(--space-lg); padding-top: var(--space-lg); border-top: 2px solid var(--color-gray-200);">
        <p style="font-size: var(--font-size-small); color: var(--color-gray-700); line-height: 1.6;">
          <strong>Atajos de teclado:</strong><br>
          Alt + A: Abrir panel<br>
          Alt + N: Narrador<br>
          Alt + C: Contraste<br>
          Alt + 1/2/3: Tamaño texto
        </p>
      </div>
    </aside>
  `;
}

export function renderBreadcrumbs(items: Array<{ text: string; url?: string }>): void {
  const container = document.getElementById('breadcrumb-nav');
  if (!container) return;

  container.innerHTML = `
    <nav aria-label="Breadcrumb">
      <ol class="breadcrumb">
        ${items
          .map((item, index) =>
            index === items.length - 1 || !item.url
              ? `<li class="breadcrumb-item" aria-current="page">${escapeHtml(item.text)}</li>`
              : `<li class="breadcrumb-item"><a href="${item.url}" class="breadcrumb-link">${escapeHtml(item.text)}</a></li>`,
          )
          .join('')}
      </ol>
    </nav>
  `;
}

function renderBackButton(): void {
  const container = document.getElementById('back-button-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; margin-top: var(--space-xxl); padding-top: var(--space-lg); border-top: 2px solid var(--color-gray-200);">
      <button id="back-button" class="btn btn-outline btn-xl" aria-label="Volver a la página anterior">
        ← Volver Atrás
      </button>
    </div>
  `;
  document.getElementById('back-button')?.addEventListener('click', () => window.history.back());
}

/**
 * Renderiza el layout común de una página. Debe llamarse antes de
 * crear el AccessibilityManager para que el panel ya exista en el DOM.
 */
export function renderLayout(activePage: PageId): void {
  renderHeader(activePage);
  renderFooter();
  renderAccessibilityPanel();
  renderBackButton();
}
