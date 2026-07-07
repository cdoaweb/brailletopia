/* ============================================
   BRAILLETOPÍA - DATOS DEL SISTEMA BRAILLE
   Fuente única de verdad para el alfabeto braille español.
   Los puntos se numeran 1-6: columna izquierda 1,2,3 y derecha 4,5,6.
   ============================================ */

export type BraillePattern = readonly [boolean, boolean, boolean, boolean, boolean, boolean];

export const BRAILLE_ALPHABET: Readonly<Record<string, BraillePattern>> = {
  A: [true, false, false, false, false, false],
  B: [true, true, false, false, false, false],
  C: [true, false, false, true, false, false],
  D: [true, false, false, true, true, false],
  E: [true, false, false, false, true, false],
  F: [true, true, false, true, false, false],
  G: [true, true, false, true, true, false],
  H: [true, true, false, false, true, false],
  I: [false, true, false, true, false, false],
  J: [false, true, false, true, true, false],
  K: [true, false, true, false, false, false],
  L: [true, true, true, false, false, false],
  M: [true, false, true, true, false, false],
  N: [true, false, true, true, true, false],
  // Ñ en braille español: puntos 1, 2, 4, 5 y 6 (⠻)
  Ñ: [true, true, false, true, true, true],
  O: [true, false, true, false, true, false],
  P: [true, true, true, true, false, false],
  Q: [true, true, true, true, true, false],
  R: [true, true, true, false, true, false],
  S: [false, true, true, true, false, false],
  T: [false, true, true, true, true, false],
  U: [true, false, true, false, false, true],
  V: [true, true, true, false, false, true],
  W: [false, true, false, true, true, true],
  X: [true, false, true, true, false, true],
  Y: [true, false, true, true, true, true],
  Z: [true, false, true, false, true, true],
};

export const VOWELS = ['A', 'E', 'I', 'O', 'U'] as const;

export function patternToKey(pattern: readonly boolean[]): string {
  return pattern.map((d) => (d ? '1' : '0')).join('');
}

const KEY_TO_LETTER: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(BRAILLE_ALPHABET).map(([letter, pattern]) => [patternToKey(pattern), letter]),
);

export function getPatternForLetter(letter: string): BraillePattern | null {
  return BRAILLE_ALPHABET[letter.toUpperCase()] ?? null;
}

export function getLetterForPattern(pattern: readonly boolean[]): string | null {
  return KEY_TO_LETTER[patternToKey(pattern)] ?? null;
}

/** Convierte una letra a su carácter Unicode braille (⠁-⠿). */
export function letterToUnicodeBraille(letter: string): string {
  const pattern = getPatternForLetter(letter);
  if (!pattern) return '';
  let codepoint = 0x2800;
  pattern.forEach((active, i) => {
    if (active) codepoint |= 1 << i;
  });
  return String.fromCodePoint(codepoint);
}
