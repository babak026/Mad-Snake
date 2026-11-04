(function (window) {
  "use strict";

  window.MadSnake = window.MadSnake || {};

  /**
   * ScoreStorage manages persistent high scores and game settings via localStorage.
   */
  class ScoreStorage {
    static DIFF_KEY = "madsnake-diff";
    static HI_PREFIX = "madsnake-hi-";
    static LEGACY_HI_KEY = "madsnake-hi";

    /**
     * Gets the saved difficulty setting.
     * @param {string} fallback
     * @returns {string}
     */
    static getSavedDifficulty(fallback = "normal") {
      try {
        const saved = localStorage.getItem(this.DIFF_KEY);
        return saved || fallback;
      } catch (e) {
        return fallback;
      }
    }

    /**
     * Saves the chosen difficulty setting.
     * @param {string} diff
     */
    static saveDifficulty(diff) {
      try {
        localStorage.setItem(this.DIFF_KEY, diff);
      } catch (e) {}
    }

    /**
     * Retrieves the high score for a specific difficulty level.
     * @param {string} diff
     * @returns {number}
     */
    static getHighScore(diff) {
      try {
        const val = localStorage.getItem(this.HI_PREFIX + diff);
        if (val !== null) return parseInt(val, 10) || 0;
        if (diff === "normal") {
          return (
            parseInt(localStorage.getItem(this.LEGACY_HI_KEY) || "0", 10) || 0
          );
        }
      } catch (e) {}
      return 0;
    }

    /**
     * Saves high score for a given difficulty level.
     * @param {string} diff
     * @param {number} score
     */
    static saveHighScore(diff, score) {
      try {
        localStorage.setItem(this.HI_PREFIX + diff, String(score));
        if (diff === "normal") {
          localStorage.setItem(this.LEGACY_HI_KEY, String(score));
        }
      } catch (e) {}
    }
  }

  window.MadSnake.ScoreStorage = ScoreStorage;
})(window);
