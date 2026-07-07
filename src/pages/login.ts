/* ============================================
   BRAILLETOPÍA - PÁGINA DE LOGIN Y REGISTRO
   Autenticación real contra la base de datos local.
   ============================================ */

import { initPage } from '../core/page';
import { renderBreadcrumbs } from '../components/layout';
import { login, register, getSession } from '../core/auth';

const manager = initPage('login');
renderBreadcrumbs([
  { text: 'Inicio', url: '../index.html' },
  { text: 'Iniciar Sesión' },
]);

// Si ya hay sesión, ir directamente a cursos
if (getSession()) {
  window.location.replace('cursos.html');
}

type Mode = 'login' | 'register';
let mode: Mode = 'login';

const form = document.getElementById('login-form') as HTMLFormElement;
const nameGroup = document.getElementById('name-group') as HTMLElement;
const nameInput = document.getElementById('name') as HTMLInputElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const rememberInput = document.getElementById('remember') as HTMLInputElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
const switchBtn = document.getElementById('switch-mode') as HTMLButtonElement;
const formTitle = document.getElementById('form-title') as HTMLElement;
const switchQuestion = document.getElementById('switch-question') as HTMLElement;

function setMode(newMode: Mode): void {
  mode = newMode;
  clearErrors();
  const isRegister = mode === 'register';
  nameGroup.style.display = isRegister ? 'block' : 'none';
  nameInput.required = isRegister;
  formTitle.textContent = isRegister ? 'Crear una Cuenta' : 'Iniciar Sesión';
  submitBtn.textContent = isRegister ? 'Registrarme' : 'Iniciar Sesión';
  switchQuestion.textContent = isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?';
  switchBtn.textContent = isRegister ? 'Iniciar sesión' : 'Crear una cuenta';
  passwordInput.autocomplete = isRegister ? 'new-password' : 'current-password';
  manager.announce(isRegister ? 'Formulario de registro' : 'Formulario de inicio de sesión');
}

switchBtn.addEventListener('click', () => setMode(mode === 'login' ? 'register' : 'login'));

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(fieldId: string, message: string): void {
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
  document.querySelectorAll<HTMLElement>('.form-input').forEach((input) => {
    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
  });
  document.querySelectorAll<HTMLElement>('.form-error').forEach((error) => {
    error.style.display = 'none';
    error.textContent = '';
  });
  const globalMsg = document.getElementById('login-error');
  if (globalMsg) {
    globalMsg.style.display = 'none';
    globalMsg.className = '';
    globalMsg.innerHTML = '';
  }
}

function showGlobalMessage(message: string, type: 'success' | 'error'): void {
  const el = document.getElementById('login-error');
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.innerHTML = `
    <div class="alert-icon">${type === 'success' ? '✓' : '⚠'}</div>
    <div class="alert-content"><p></p></div>
  `;
  el.querySelector('p')!.textContent = message;
  el.style.display = 'flex';
  manager.announce(message);
}

function validate(): boolean {
  clearErrors();
  let valid = true;

  if (mode === 'register' && !nameInput.value.trim()) {
    showError('name', 'El nombre es obligatorio');
    valid = false;
  }

  const email = emailInput.value.trim();
  if (!email) {
    showError('email', 'El correo electrónico es obligatorio');
    valid = false;
  } else if (!isValidEmail(email)) {
    showError('email', 'Por favor, introduce un correo electrónico válido');
    valid = false;
  }

  const password = passwordInput.value;
  if (!password) {
    showError('password', 'La contraseña es obligatoria');
    valid = false;
  } else if (password.length < 6) {
    showError('password', 'La contraseña debe tener al menos 6 caracteres');
    valid = false;
  }

  return valid;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) {
    manager.announce('Por favor, corrige los errores en el formulario');
    return;
  }

  submitBtn.disabled = true;
  try {
    if (mode === 'register') {
      const result = await register(nameInput.value, emailInput.value, passwordInput.value);
      if (!result.ok) {
        showGlobalMessage(result.error, 'error');
        return;
      }
      // Iniciar sesión automáticamente tras el registro
      await login(emailInput.value, passwordInput.value, rememberInput.checked);
      showGlobalMessage('¡Cuenta creada! Redirigiendo a los cursos…', 'success');
    } else {
      const result = await login(emailInput.value, passwordInput.value, rememberInput.checked);
      if (!result.ok) {
        showGlobalMessage(result.error, 'error');
        return;
      }
      showGlobalMessage('¡Inicio de sesión exitoso! Redirigiendo…', 'success');
    }
    window.setTimeout(() => {
      window.location.href = 'cursos.html';
    }, 1200);
  } finally {
    submitBtn.disabled = false;
  }
});

emailInput.addEventListener('blur', () => {
  if (emailInput.value.trim() && !isValidEmail(emailInput.value)) {
    showError('email', 'Por favor, introduce un correo electrónico válido');
  }
});
