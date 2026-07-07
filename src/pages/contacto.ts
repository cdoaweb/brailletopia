/* ============================================
   BRAILLETOPÍA - PÁGINA DE CONTACTO
   Valida el formulario y guarda el mensaje en la base de datos.
   ============================================ */

import { initPage } from '../core/page';
import { renderBreadcrumbs } from '../components/layout';
import { db } from '../core/db';

const manager = initPage('contacto');
renderBreadcrumbs([
  { text: 'Inicio', url: '../index.html' },
  { text: 'Contacto' },
]);

const form = document.getElementById('contact-form') as HTMLFormElement | null;

if (form) {
  const nameInput = document.getElementById('name') as HTMLInputElement;
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const subjectInput = document.getElementById('subject') as HTMLSelectElement | HTMLInputElement;
  const messageInput = document.getElementById('message') as HTMLTextAreaElement;
  const consentInput = document.getElementById('consent') as HTMLInputElement;
  const messagesEl = document.getElementById('form-messages');

  function showFieldError(fieldId: string, message: string): void {
    const input = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`${fieldId}-error`);
    input?.classList.add('error');
    input?.setAttribute('aria-invalid', 'true');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'flex';
    }
  }

  function clearErrors(): void {
    form!.querySelectorAll<HTMLElement>('.error').forEach((el) => {
      el.classList.remove('error');
      el.setAttribute('aria-invalid', 'false');
    });
    form!.querySelectorAll<HTMLElement>('.form-error').forEach((el) => {
      el.style.display = 'none';
      el.textContent = '';
    });
    if (messagesEl) {
      messagesEl.innerHTML = '';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    let valid = true;
    if (!nameInput.value.trim()) {
      showFieldError('name', 'El nombre es obligatorio');
      valid = false;
    }
    const email = emailInput.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError('email', 'Por favor, introduce un correo electrónico válido');
      valid = false;
    }
    if (!subjectInput.value) {
      showFieldError('subject', 'Selecciona un asunto');
      valid = false;
    }
    if (!messageInput.value.trim()) {
      showFieldError('message', 'El mensaje es obligatorio');
      valid = false;
    }
    if (!consentInput.checked) {
      showFieldError('consent', 'Debes aceptar la política de privacidad');
      valid = false;
    }

    if (!valid) {
      manager.announce('Por favor, corrige los errores en el formulario');
      return;
    }

    db.insert('messages', {
      name: nameInput.value.trim(),
      email,
      subject: subjectInput.value,
      message: messageInput.value.trim(),
      sentAt: new Date().toISOString(),
    });

    form.reset();
    if (messagesEl) {
      messagesEl.innerHTML = `
        <div class="alert alert-success" role="status">
          <div class="alert-icon">✓</div>
          <div class="alert-content">
            <p>¡Mensaje enviado correctamente! Te responderemos lo antes posible.</p>
          </div>
        </div>
      `;
    }
    manager.announce('Mensaje enviado correctamente. Te responderemos lo antes posible.');
  });
}
