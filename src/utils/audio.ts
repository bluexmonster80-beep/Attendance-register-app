// Synthesized native micro-haptics and audio feedback for mobile UI
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private getContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        if (type === 'light') navigator.vibrate(10);
        else if (type === 'medium') navigator.vibrate(20);
        else if (type === 'success') navigator.vibrate([15, 30, 20]);
        else if (type === 'warning') navigator.vibrate([30, 50, 30]);
      } catch {
        // Ignored
      }
    }
  }

  public playAttendanceTone(status: 'P' | 'A' | 'L' | 'U') {
    if (!this.enabled) return;
    try {
      this.triggerHaptic(status === 'P' ? 'success' : status === 'A' ? 'warning' : 'light');
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      let freq = 523.25; // C5

      if (status === 'P') {
        freq = 659.25; // E5 - pleasant success chime
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      } else if (status === 'A') {
        freq = 311.13; // Eb4 - soft caution
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      } else if (status === 'L') {
        freq = 440; // A4 - alert chime
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      } else {
        freq = 493.88; // B4 - crisp soft click
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      }

      osc.frequency.setValueAtTime(freq, now);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio context may not be allowed prior to user interaction
    }
  }
}

export const soundFX = new SoundFX();
