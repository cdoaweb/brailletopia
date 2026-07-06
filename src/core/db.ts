/* ============================================
   BRAILLETOPÍA - BASE DE DATOS SENCILLA
   Base de datos tipada sobre localStorage con colecciones:
   users, progress, scores y messages. Cada colección se
   guarda bajo su propia clave con el prefijo "btdb:".
   ============================================ */

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  updatedAt: string;
}

export interface GameScore {
  id: string;
  userId: string | null;
  playerName: string;
  game: string;
  level: string;
  score: number;
  maxScore: number;
  playedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
}

interface Schema {
  users: User;
  progress: CourseProgress;
  scores: GameScore;
  messages: ContactMessage;
}

type CollectionName = keyof Schema;

const PREFIX = 'btdb:';

function read<K extends CollectionName>(name: K): Schema[K][] {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    return raw ? (JSON.parse(raw) as Schema[K][]) : [];
  } catch {
    return [];
  }
}

function write<K extends CollectionName>(name: K, rows: Schema[K][]): void {
  localStorage.setItem(PREFIX + name, JSON.stringify(rows));
}

export function generateId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const db = {
  getAll<K extends CollectionName>(name: K): Schema[K][] {
    return read(name);
  },

  find<K extends CollectionName>(
    name: K,
    predicate: (row: Schema[K]) => boolean,
  ): Schema[K] | undefined {
    return read(name).find(predicate);
  },

  filter<K extends CollectionName>(
    name: K,
    predicate: (row: Schema[K]) => boolean,
  ): Schema[K][] {
    return read(name).filter(predicate);
  },

  insert<K extends CollectionName>(name: K, row: Omit<Schema[K], 'id'>): Schema[K] {
    const rows = read(name);
    const newRow = { ...row, id: generateId() } as Schema[K];
    rows.push(newRow);
    write(name, rows);
    return newRow;
  },

  update<K extends CollectionName>(
    name: K,
    id: string,
    changes: Partial<Schema[K]>,
  ): Schema[K] | undefined {
    const rows = read(name);
    const index = rows.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    rows[index] = { ...rows[index], ...changes, id };
    write(name, rows);
    return rows[index];
  },

  remove<K extends CollectionName>(name: K, id: string): boolean {
    const rows = read(name);
    const remaining = rows.filter((r) => r.id !== id);
    if (remaining.length === rows.length) return false;
    write(name, remaining);
    return true;
  },
};
