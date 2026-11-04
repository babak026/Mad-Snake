(function (window) {
  "use strict";

  window.MadSnake = window.MadSnake || {};

  /**
   * SoundManager handles 8-bit sound synthesis via the Web Audio API.
   */
  class SoundManager {
    constructor() {
      this.audioContext = null;
    }

    /**
     * Initializes or resumes the audio context upon user gesture.
     */
    initContext() {
      try {
        if (!this.audioContext) {
          const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
          }
        }
        if (this.audioContext && this.audioContext.state === "suspended") {
          this.audioContext.resume();
        }
      } catch (e) {
        // AudioContext may fail silently if unsupported or restricted
      }
    }

    /**
     * Plays a basic tone at a specified frequency and duration.
     * @param {number} freq - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type (default: 'square')
     * @param {number} gainVal - Volume level (default: 0.04)
     */
    beep(freq, duration, type = "square", gainVal = 0.04) {
      try {
        this.initContext();
        if (!this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = gainVal;

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;
        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {}
    }

    playEat() {
      this.beep(880, 0.08);
    }

    playDie() {
      this.beep(120, 0.4, "square", 0.06);
    }

    playStart() {
      this.beep(520, 0.06);
      setTimeout(() => this.beep(780, 0.08), 70);
    }

    playPause() {
      this.beep(440, 0.05);
    }

    playResume() {
      this.beep(660, 0.05);
    }

    playClick() {
      this.beep(440, 0.04);
    }
  }

  window.MadSnake.SoundManager = SoundManager;
})(window);
