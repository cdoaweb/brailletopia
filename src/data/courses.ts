/* ============================================
   BRAILLETOPÍA - CATÁLOGO DE CURSOS
   Cada curso tiene lecciones (una letra o concepto por lección).
   El progreso del usuario se guarda en la colección "progress".
   ============================================ */

export type CourseLevel = 'principiante' | 'intermedio' | 'avanzado';
export type CourseCategory = 'alfabeto' | 'numeros' | 'puntuacion' | 'escritura';

export interface Lesson {
  title: string;
  /** Letra a practicar en la lección (si aplica). */
  letter?: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  icon: string;
  level: CourseLevel;
  category: CourseCategory;
  description: string;
  lessons: Lesson[];
}

function letterLessons(letters: string, intro: string): Lesson[] {
  return letters.split('').map((letter) => ({
    title: `Letra ${letter}`,
    letter,
    description: `${intro} Observa el patrón de puntos de la letra ${letter} y reprodúcelo en la celda.`,
  }));
}

export const COURSES: Course[] = [
  {
    id: 'alfabeto-1',
    title: 'Alfabeto Braille: primera serie',
    icon: 'A',
    level: 'principiante',
    category: 'alfabeto',
    description:
      'Aprende las diez primeras letras (A-J), la base de todo el sistema braille: solo usan los puntos superiores 1, 2, 4 y 5.',
    lessons: letterLessons('ABCDEFGHIJ', 'Primera serie del alfabeto.'),
  },
  {
    id: 'alfabeto-2',
    title: 'Alfabeto Braille: segunda serie',
    icon: 'K',
    level: 'principiante',
    category: 'alfabeto',
    description:
      'Las letras K-T se forman añadiendo el punto 3 a las de la primera serie. Descubre el patrón y memorízalas fácilmente.',
    lessons: letterLessons('KLMNOPQRST', 'Segunda serie: primera serie + punto 3.'),
  },
  {
    id: 'alfabeto-3',
    title: 'Alfabeto Braille: tercera serie y Ñ',
    icon: 'Ñ',
    level: 'intermedio',
    category: 'alfabeto',
    description:
      'Completa el alfabeto con U-Z añadiendo el punto 6, y aprende la Ñ, exclusiva del braille español.',
    lessons: letterLessons('UVWXYZÑ', 'Tercera serie: se añade el punto 6.'),
  },
  {
    id: 'vocales',
    title: 'Las Vocales',
    icon: '⠁',
    level: 'principiante',
    category: 'alfabeto',
    description:
      'Un repaso intensivo de las cinco vocales, las letras más frecuentes del español. Perfecto como primer contacto con el braille.',
    lessons: letterLessons('AEIOU', 'Practica las vocales.'),
  },
  {
    id: 'numeros',
    title: 'Números en Braille',
    icon: '⠼',
    level: 'intermedio',
    category: 'numeros',
    description:
      'Los números se escriben con las letras A-J precedidas del signo numérico (puntos 3, 4, 5 y 6). Domina el 0 al 9.',
    lessons: [
      {
        title: 'El signo numérico',
        description:
          'El indicador numérico (puntos 3, 4, 5 y 6) avisa de que lo que sigue es un número, no una letra.',
      },
      ...letterLessons('ABCDEFGHIJ', 'Con el signo numérico delante, esta letra representa un número (A=1, B=2… J=0).'),
    ],
  },
  {
    id: 'escritura',
    title: 'Escritura con Teclado Perkins',
    icon: '⌨',
    level: 'avanzado',
    category: 'escritura',
    description:
      'Aprende la técnica de escritura por acordes de la máquina Perkins: cada dedo controla un punto de la celda.',
    lessons: [
      {
        title: 'Posición de las manos',
        description:
          'Índice, corazón y anular de la mano izquierda controlan los puntos 1, 2 y 3; los de la derecha, los puntos 4, 5 y 6.',
      },
      { title: 'Letra A', letter: 'A', description: 'Escribe la A: solo el punto 1 (índice izquierdo).' },
      { title: 'Letra L', letter: 'L', description: 'Escribe la L: puntos 1, 2 y 3 (toda la mano izquierda).' },
      { title: 'Letra P', letter: 'P', description: 'Escribe la P: puntos 1, 2, 3 y 4 (acorde con ambas manos).' },
      { title: 'Letra Y', letter: 'Y', description: 'Escribe la Y: puntos 1, 3, 4, 5 y 6. ¡Un acorde completo!' },
    ],
  },
];

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  alfabeto: 'Alfabeto',
  numeros: 'Números',
  puntuacion: 'Puntuación',
  escritura: 'Escritura',
};
