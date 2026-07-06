/* ============================================
   BRAILLETOPÍA - AUTENTICACIÓN
   Registro e inicio de sesión contra la colección "users".
   La contraseña se guarda como hash SHA-256 (suficiente para
   una demo educativa sin servidor; no usar en producción real).
   ============================================ */

import { db, type User } from './db';

const SESSION_KEY = 'btdb:session';

export interface Session {
  userId: string;
  name: string;
  email: string;
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session, remember: boolean): void {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.find('users', (u) => u.email === normalizedEmail);
  if (existing) {
    return { ok: false, error: 'Ya existe una cuenta con este correo electrónico.' };
  }

  const passwordHash = await hashPassword(password);
  const user = db.insert('users', {
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  });
  return { ok: true, user };
}

export async function login(
  email: string,
  password: string,
  remember: boolean,
): Promise<{ ok: true; session: Session } | { ok: false; error: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.find('users', (u) => u.email === normalizedEmail);
  if (!user) {
    return { ok: false, error: 'No existe ninguna cuenta con este correo. Regístrate primero.' };
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    return { ok: false, error: 'La contraseña no es correcta.' };
  }

  const session: Session = { userId: user.id, name: user.name, email: user.email };
  saveSession(session, remember);
  return { ok: true, session };
}
