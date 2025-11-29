// assets/js/sound-manager.js
export class SoundManager {
    constructor() {
        this.ctx = (window.AudioContext || window.webkitAudioContext)
            ? new (window.AudioContext || window.webkitAudioContext)()
            : null;

        this.soundsOn = localStorage.getItem('sounds_on') !== 'false';
        this.masterVolume = 0.3;
    }

    setSoundsOn(on) {
        this.soundsOn = on;
        localStorage.setItem('sounds_on', on);
    }

    playUxPrimary(success = true) {
        if (!this.canPlay()) return;
        this._beep({
            type: success ? 'triangle' : 'sine',
            startFreq: success ? 550 : 260,
            endFreq: success ? 750 : 180,
            duration: success ? 0.1 : 0.12,
        });
    }

    playUxSecondaryError() {
        if (!this.canPlay()) return;
        this._beep({
            type: 'sawtooth',
            startFreq: 220,
            endFreq: 160,
            duration: 0.25,
        });
    }

    playHero() {
        if (!this.canPlay()) return;

        const notes = [600, 800, 1000];
        notes.forEach((freq, index) => {
            this._beep({
                type: 'triangle',
                startFreq: freq,
                endFreq: freq + 100,
                duration: 0.15,
                offset: index * 0.16,
            });
        });
    }

    playToggle() {
        if (!this.canPlay()) return;
        this._beep({
            type: 'sine',
            startFreq: 400,
            endFreq: 500,
            duration: 0.08,
        });
    }

    canPlay() {
        return this.ctx && this.soundsOn;
    }

    _beep({ type, startFreq, endFreq, duration, offset = 0 }) {
        const now = this.ctx.currentTime + offset;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

        gain.gain.setValueAtTime(this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration + 0.05);
    }
}

export const soundManager = new SoundManager();
