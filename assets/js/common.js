// assets/js/common.js
// Este archivo contiene utilidades compartidas para insertar la cabecera y el pie de página
// en todas las páginas.  De esta manera evitamos repetir el mismo marcado en cada
// documento HTML y garantizamos consistencia y accesibilidad.  El pie incluye
// un aviso de copyright dinámico basado en el año actual.

/**
 * Inserta la cabecera y el pie de página en el DOM.  Esta función debe
 * ejecutarse tan pronto como sea posible (por ejemplo dentro de un
 * `DOMContentLoaded` o directamente en un módulo) para que los
 * botones de accesibilidad se creen antes de inicializar el
 * AccessibilityManager.
 */
export function insertHeaderFooter() {
    const body = document.body;
    if (!body) return;

    // Definición del HTML de la cabecera.  Contiene el salto rápido al
    // contenido principal, el panel de accesibilidad, el logo y la navegación.
    const headerHTML = `
    <a href="#main-content" class="btn btn-primary sr-only" style="position:absolute; top:0; z-index:999;">Saltar al contenido principal</a>
    <header role="banner">
      <div class="container">
        <div class="access-panel" aria-label="Herramientas de accesibilidad">
            <button id="btn-contrast" class="btn btn-secondary" aria-label="Alternar alto contraste">👁️ Contraste</button>
            <button id="btn-inc-text" class="btn btn-secondary" aria-label="Aumentar tamaño de texto">A+</button>
            <button id="btn-narrator" class="btn btn-secondary" aria-label="Activar o desactivar narrador y leer página">🔊 Narrador</button>
        </div>
        <div class="nav-flex">
            <a href="index.html" aria-label="Brailletopía, ir al inicio" style="font-size: 1.5rem; font-weight: 700; text-decoration: none; color: var(--col-primary);">
                BRAILLETOPÍA ⠃⠗⠇
            </a>
            <nav role="navigation" aria-label="Menú principal">
                <ul style="list-style: none; display: flex; gap: 20px;">
                    <li><a href="cursos.html" class="btn btn-secondary">Cursos</a></li>
                    <li><a href="juegos.html" class="btn btn-secondary">Juegos</a></li>
                    <li><a href="parent-settings.html" class="btn btn-secondary">Familia</a></li>
                    <li><a href="contacto.html" class="btn btn-primary">Contacto</a></li>
                </ul>
            </nav>
        </div>
      </div>
    </header>
    `;

    // Definición del HTML del pie de página.  El texto de copyright se
    // completará dinámicamente más abajo.
    const footerHTML = `
    <footer role="contentinfo">
      <div class="container">
        <p id="copyright-text"></p>
        <nav aria-label="Enlaces legales y de contacto">
            <ul style="list-style: none; display: flex; gap: 20px; margin-top: 20px;">
                <li><a href="aviso-legal.html">Aviso Legal</a></li>
                <li><a href="accesibilidad.html">Accesibilidad</a></li>
                <li><a href="contacto.html">Contacto</a></li>
            </ul>
        </nav>
      </div>
    </footer>
    `;

    // Insertar la cabecera al principio del body.
    body.insertAdjacentHTML('afterbegin', headerHTML);
    // Insertar el pie al final del body.
    body.insertAdjacentHTML('beforeend', footerHTML);

    // Asignar el año actual al texto de copyright para mantenerlo siempre
    // actualizado sin necesidad de editar el HTML manualmente cada año.
    const copyEl = document.getElementById('copyright-text');
    if (copyEl) {
        const year = new Date().getFullYear();
        copyEl.textContent = `© ${year} Brailletopía. Diseño Universal para el Aprendizaje.`;
    }
}