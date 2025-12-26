/* ============================================
   BRAILLETOPÍA - CARGADOR DE COMPONENTES
   Carga header, footer y panel de accesibilidad
   ============================================ */

// Función para cargar componentes HTML
async function loadComponent(elementId, componentPath) {
  try {
    const response = await fetch(componentPath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
      // Ejecutar scripts dentro del componente
      const scripts = element.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
      });
    }
  } catch (error) {
    console.error('Error cargando componente:', componentPath, error);
  }
}

// Función para crear el panel de accesibilidad
function createAccessibilityPanel() {
  const panel = `
    <!-- Botón de Accesibilidad -->
    <button 
      id="accessibility-toggle" 
      class="accessibility-toggle" 
      aria-label="Abrir panel de accesibilidad"
      aria-expanded="false"
      aria-controls="accessibility-panel"
    >
      ♿
    </button>
    
    <!-- Panel de Accesibilidad -->
    <aside id="accessibility-panel" class="accessibility-panel" role="complementary" aria-label="Panel de controles de accesibilidad">
      <div class="accessibility-panel-header">
        <h2 class="accessibility-panel-title">Accesibilidad</h2>
        <button id="accessibility-close" class="accessibility-close" aria-label="Cerrar panel de accesibilidad">
          ✕
        </button>
      </div>
      
      <!-- Control de Tamaño de Texto -->
      <div class="accessibility-control">
        <label class="accessibility-control-label">Tamaño de texto</label>
        <div class="accessibility-buttons">
          <button class="accessibility-btn active" data-text-size="normal" aria-pressed="true">Normal</button>
          <button class="accessibility-btn" data-text-size="large" aria-pressed="false">Grande</button>
          <button class="accessibility-btn" data-text-size="xlarge" aria-pressed="false">XL</button>
        </div>
      </div>
      
      <!-- Control de Contraste -->
      <div class="accessibility-control">
        <label class="accessibility-control-label">Contraste</label>
        <div class="accessibility-buttons">
          <button class="accessibility-btn active" data-contrast="normal" aria-pressed="true">Normal</button>
          <button class="accessibility-btn" data-contrast="high" aria-pressed="false">Alto</button>
        </div>
      </div>
      
      <!-- Control de Narrador -->
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
      
      <!-- Información de Atajos -->
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
  
  const accessibilityContainer = document.getElementById('accessibility-container');
  if (accessibilityContainer) {
    accessibilityContainer.innerHTML = panel;
  }
}

// Función para crear breadcrumbs dinámicos
function createBreadcrumbs(items) {
  const breadcrumbNav = document.getElementById('breadcrumb-nav');
  if (!breadcrumbNav) return;
  
  const breadcrumbHTML = `
    <nav aria-label="Breadcrumb" class="breadcrumb">
      <ol class="breadcrumb">
        ${items.map((item, index) => {
          if (index === items.length - 1) {
            return `<li class="breadcrumb-item">${item.text}</li>`;
          } else {
            return `<li class="breadcrumb-item"><a href="${item.url}" class="breadcrumb-link">${item.text}</a></li>`;
          }
        }).join('')}
      </ol>
    </nav>
  `;
  
  breadcrumbNav.innerHTML = breadcrumbHTML;
}

// Función para crear botón "Volver"
function createBackButton() {
  const backButtonContainer = document.getElementById('back-button-container');
  if (!backButtonContainer) return;
  
  const backButtonHTML = `
    <div style="text-align: center; margin-top: var(--space-xxl); padding-top: var(--space-lg); border-top: 2px solid var(--color-gray-200);">
      <button onclick="window.history.back()" class="btn btn-outline btn-xl" aria-label="Volver a la página anterior">
        ← Volver Atrás
      </button>
    </div>
  `;
  
  backButtonContainer.innerHTML = backButtonHTML;
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async () => {
  // Determinar la ruta base según la ubicación
  const isInSubfolder = window.location.pathname.includes('/pages/');
  const basePath = isInSubfolder ? '../' : './';
  
  // Cargar componentes
  await loadComponent('header-container', `${basePath}components/header.html`);
  await loadComponent('footer-container', `${basePath}components/footer.html`);
  
  // Crear panel de accesibilidad
  createAccessibilityPanel();
  
  // Crear botón de volver si existe el contenedor
  createBackButton();
});

// Exportar funciones para uso global
window.createBreadcrumbs = createBreadcrumbs;
window.createBackButton = createBackButton;
