(function (window) {
  "use strict";

  window.MadSnake = window.MadSnake || {};

  /**
   * Difficulty configuration model defining speeds, acceleration, food counts,
   * and max speed limits for each difficulty mode.
   */
  class DifficultyConfig {
    static DIFFICULTIES = {
      easy: {
        id: "easy",
        name: "EASY",
        initialSpeed: 175,
        maxSpeed: 70,
        speedStep: 4,
        foodCount: 5,
        desc: "Start: 175ms · Max: 70ms · 5 Foods",
      },
      normal: {
        id: "normal",
        name: "NORMAL",
        initialSpeed: 135,
        maxSpeed: 45,
        speedStep: 6,
        foodCount: 4,
        desc: "Start: 135ms · Max: 45ms · 4 Foods",
      },
      hard: {
        id: "hard",
        name: "HARD",
        initialSpeed: 95,
        maxSpeed: 30,
        speedStep: 8,
        foodCount: 3,
        desc: "Start: 95ms · Max: 30ms · 3 Foods",
      },
    };

    static KEYS = ["easy", "normal", "hard"];
    static DEFAULT_KEY = "normal";

    /**
     * Retrieves difficulty configuration for a given key.
     * @param {string} key
     * @returns {object}
     */
    static get(key) {
      return this.DIFFICULTIES[key] || this.DIFFICULTIES[this.DEFAULT_KEY];
    }

    /**
     * Cycles to the next or previous difficulty.
     * @param {string} currentKey
     * @param {number} direction - 1 for next, -1 for previous
     * @returns {string}
     */
    static getNext(currentKey, direction = 1) {
      const idx = this.KEYS.indexOf(currentKey);
      const safeIdx = idx === -1 ? 0 : idx;
      const nextIdx =
        (safeIdx + direction + this.KEYS.length) % this.KEYS.length;
      return this.KEYS[nextIdx];
    }

    /**
     * Checks if key is valid.
     * @param {string} key
     * @returns {boolean}
     */
    static isValid(key) {
      return Boolean(this.DIFFICULTIES[key]);
    }
  }

  window.MadSnake.DifficultyConfig = DifficultyConfig;
})(window);
