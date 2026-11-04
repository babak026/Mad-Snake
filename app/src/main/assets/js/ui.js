(function (window) {
  "use strict";

  window.MadSnake = window.MadSnake || {};

  /**
   * UIManager handles all DOM interactions, modal overlays, HUD status updates,
   * and difficulty button indicators.
   */
  class UIManager {
    constructor() {
      // HUD elements
      this.scoreEl = document.getElementById("sc");
      this.highScoreEl = document.getElementById("hi");
      this.barDiffEl = document.getElementById("bar-diff");
      this.barPauseBtn = document.getElementById("bar-pause");
      this.padPauseBtn = document.getElementById("pad-pause");

      // Overlays
      this.menuOverlay = document.getElementById("menu-overlay");
      this.pauseOverlay = document.getElementById("pause-overlay");
      this.gameoverOverlay = document.getElementById("gameover-overlay");

      // Menu elements
      this.menuHiEl = document.getElementById("menu-hi");
      this.diffDescEl = document.getElementById("diff-desc");
      this.diffBtns = document.querySelectorAll(".diff-btn");
      this.startBtn = document.getElementById("start-btn");

      // Pause elements
      this.resumeBtn = document.getElementById("resume-btn");
      this.restartBtn = document.getElementById("restart-btn");
      this.menuFromPauseBtn = document.getElementById("menu-from-pause-btn");
      this.pauseScEl = document.getElementById("pause-sc");
      this.pauseDiffEl = document.getElementById("pause-diff");

      // Game Over elements
      this.playAgainBtn = document.getElementById("play-again-btn");
      this.menuFromGoBtn = document.getElementById("menu-from-go-btn");
      this.goScEl = document.getElementById("go-sc");
      this.goHiEl = document.getElementById("go-hi");
      this.goDiffEl = document.getElementById("go-diff");
      this.goNewHiEl = document.getElementById("gameover-newhi");
    }

    /**
     * Hides all overlays.
     */
    hideOverlays() {
      if (this.menuOverlay) this.menuOverlay.classList.add("hidden");
      if (this.pauseOverlay) this.pauseOverlay.classList.add("hidden");
      if (this.gameoverOverlay) this.gameoverOverlay.classList.add("hidden");
    }

    /**
     * Displays the Main Menu overlay and refreshes its record value.
     * @param {number} highScore
     */
    showMenu(highScore) {
      this.hideOverlays();
      if (this.menuHiEl) this.menuHiEl.textContent = highScore;
      if (this.menuOverlay) this.menuOverlay.classList.remove("hidden");
    }

    /**
     * Displays the Pause overlay with current stats.
     * @param {number} score
     * @param {string} diffName
     */
    showPause(score, diffName) {
      this.hideOverlays();
      if (this.pauseScEl) this.pauseScEl.textContent = score;
      if (this.pauseDiffEl) this.pauseDiffEl.textContent = diffName;
      if (this.pauseOverlay) this.pauseOverlay.classList.remove("hidden");
    }

    /**
     * Displays the Game Over overlay with final results.
     * @param {number} score
     * @param {number} highScore
     * @param {string} diffName
     * @param {boolean} isNewRecord
     */
    showGameOver(score, highScore, diffName, isNewRecord) {
      this.hideOverlays();
      if (this.goScEl) this.goScEl.textContent = score;
      if (this.goHiEl) this.goHiEl.textContent = highScore;
      if (this.goDiffEl) this.goDiffEl.textContent = diffName;
      if (this.goNewHiEl) {
        if (isNewRecord) {
          this.goNewHiEl.classList.remove("hidden");
        } else {
          this.goNewHiEl.classList.add("hidden");
        }
      }
      if (this.gameoverOverlay) this.gameoverOverlay.classList.remove("hidden");
    }

    /**
     * Updates the current score readout in the top bar.
     * @param {number} score
     */
    updateScore(score) {
      if (this.scoreEl) this.scoreEl.textContent = score;
    }

    /**
     * Updates the high score readout in top bar and menu.
     * @param {number} highScore
     */
    updateHighScore(highScore) {
      if (this.highScoreEl) this.highScoreEl.textContent = highScore;
      if (this.menuHiEl) this.menuHiEl.textContent = highScore;
    }

    /**
     * Updates the difficulty selection UI (active button, description, and bar badge).
     * @param {string} activeDiffKey
     * @param {object} diffConfig
     * @param {number} highScore
     */
    updateDifficulty(activeDiffKey, diffConfig, highScore) {
      this.diffBtns.forEach((btn) => {
        const isActive = btn.getAttribute("data-diff") === activeDiffKey;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-checked", isActive ? "true" : "false");
      });

      if (this.diffDescEl) this.diffDescEl.textContent = diffConfig.desc;
      if (this.barDiffEl) this.barDiffEl.textContent = diffConfig.name;
      this.updateHighScore(highScore);
    }
  }

  window.MadSnake.UIManager = UIManager;
})(window);
