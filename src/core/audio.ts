/* ============================================
   BRAILLETOPÍA - FEEDBACK SONORO
   Un único AudioContext compartido (crear uno por sonido
   agota los contextos del navegador y termina fallando).
   ============================================ */

export type SoundType =
  | 'dot-on'
  | 'dot-off'
  | 'key'
  | 'write'
  | 'backspace'
  | 'success'
  | 'error';

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (!('AudioContext' in window)) return null;
  if (!context) context = new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}

const FREQUENCIES: Record<SoundType, number> = {
  'dot-on': 800,
  'dot-off': 400,
  key: 600,
  write: 1000,
  backspace: 300,
  success: 800,
  error: 300,
};

export function playSound(type: SoundType): void {
  const ctx = getContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.frequency.value = FREQUENCIES[type];
  gain.gain.value = 0.1;

  oscillator.start();
  if (type === 'success') {
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
    oscillator.stop(ctx.currentTime + 0.2);
  } else if (type === 'error') {
    oscillator.stop(ctx.currentTime + 0.3);
  } else {
    oscillator.stop(ctx.currentTime + 0.1);
  }
}
