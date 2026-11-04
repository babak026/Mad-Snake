(function (window) {
  "use strict";

  window.MadSnake = window.MadSnake || {};

  /**
   * InputHandler binds and translates keyboard, touch/swipe, and on-screen
   * button inputs into semantic actions for SnakeGame.
   */
  class InputHandler {
    /**
     * @param {object} game - Reference to SnakeGame instance
     */
    constructor(game) {
      this.game = game;
      this.touchStartX = null;
      this.touchStartY = null;
    }

    /**
     * Binds all input listeners.
     */
    bindAll() {
      this.bindKeyboard();
      this.bindDpad();
      this.bindSwipe();
      this.bindUIButtons();
      this.bindVisibility();
    }

    /**
     * Binds keyboard controls.
     */
    bindKeyboard() {
      const KEY_DIR_MAP = {
        ArrowUp: "U",
        ArrowDown: "D",
        ArrowLeft: "L",
        ArrowRight: "R",
        w: "U",
        W: "U",
        s: "D",
        S: "D",
        a: "L",
        A: "L",
        d: "R",
        D: "R",
      };

      document.addEventListener("keydown", (e) => {
        const k = e.key;
        const state = this.game.state;

        if (state === "menu") {
          if (k === "Enter" || k === " ") {
            e.preventDefault();
            this.game.start();
            return;
          }
          if (k === "ArrowLeft" || k === "a" || k === "A") {
            e.preventDefault();
            this.game.cycleDifficulty(-1);
            return;
          }
          if (k === "ArrowRight" || k === "d" || k === "D") {
            e.preventDefault();
            this.game.cycleDifficulty(1);
            return;
          }
          return;
        }

        if (state === "paused") {
          if (
            k === " " ||
            k === "p" ||
            k === "P" ||
            k === "Escape" ||
            k === "Enter"
          ) {
            e.preventDefault();
            this.game.resume();
            return;
          }
          return;
        }

        if (state === "over") {
          if (k === "Enter" || k === " ") {
            e.preventDefault();
            this.game.start();
            return;
          }
          if (k === "Escape" || k === "m" || k === "M") {
            e.preventDefault();
            this.game.returnToMenu();
            return;
          }
          return;
        }

        // Running state
        if (KEY_DIR_MAP[k]) {
          e.preventDefault();
          this.game.snake.queueDirection(KEY_DIR_MAP[k]);
        } else if (k === " " || k === "p" || k === "P" || k === "Escape") {
          e.preventDefault();
          this.game.pause();
        }
      });
    }

    /**
     * Binds on-screen D-pad buttons.
     */
    bindDpad() {
      const dpadButtons = document.querySelectorAll(".pad button[data-d]");
      dpadButtons.forEach((btn) => {
        btn.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          const d = btn.getAttribute("data-d");
          if (this.game.state === "running") {
            this.game.snake.queueDirection(d);
          } else if (this.game.state === "menu") {
            if (d === "L") this.game.cycleDifficulty(-1);
            else if (d === "R") this.game.cycleDifficulty(1);
            else if (d === "U" || d === "D") this.game.start();
          }
        });
      });
    }

    /**
     * Binds swipe gesture detection for mobile devices.
     */
    bindSwipe() {
      document.addEventListener(
        "touchstart",
        (e) => {
          if (e.target.closest("button") || e.target.closest(".overlay")) {
            this.touchStartX = null;
            this.touchStartY = null;
            return;
          }
          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;
        },
        { passive: true },
      );

      document.addEventListener("touchend", (e) => {
        if (this.touchStartX === null || this.touchStartY === null) return;

        const touch = e.changedTouches[0];
        const dx = touch.clientX - this.touchStartX;
        const dy = touch.clientY - this.touchStartY;

        if (Math.max(Math.abs(dx), Math.abs(dy)) >= 24) {
          if (this.game.state === "running") {
            const dir =
              Math.abs(dx) > Math.abs(dy)
                ? dx > 0
                  ? "R"
                  : "L"
                : dy > 0
                  ? "D"
                  : "U";
            this.game.snake.queueDirection(dir);
          }
        }

        this.touchStartX = null;
        this.touchStartY = null;
      });
    }

    /**
     * Binds interactive buttons across overlays and HUD.
     */
    bindUIButtons() {
      const ui = this.game.ui;

      // Difficulty buttons
      ui.diffBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          this.game.setDifficulty(btn.getAttribute("data-diff"));
          this.game.sound.playClick();
        });
      });

      // Start Game button
      if (ui.startBtn) {
        ui.startBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.game.start();
        });
      }

      // Resume button
      if (ui.resumeBtn) {
        ui.resumeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.game.resume();
        });
      }

      // Restart button
      if (ui.restartBtn) {
        ui.restartBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.game.start();
        });
      }

      // Menu from Pause
      if (ui.menuFromPauseBtn) {
        ui.menuFromPauseBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.game.returnToMenu();
        });
      }

      // Play Again button
      if (ui.playAgainBtn) {
        ui.playAgainBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.game.start();
        });
      }

      // Menu from Game Over
      if (ui.menuFromGoBtn) {
        ui.menuFromGoBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.game.returnToMenu();
        });
      }

      // Pause toggle buttons (top bar & D-pad)
      const handlePauseToggle = (e) => {
        e.preventDefault();
        if (this.game.state === "running") {
          this.game.pause();
        } else if (this.game.state === "paused") {
          this.game.resume();
        } else if (this.game.state === "menu") {
          this.game.start();
        }
      };

      if (ui.barPauseBtn) {
        ui.barPauseBtn.addEventListener("click", handlePauseToggle);
      }
      if (ui.padPauseBtn) {
        ui.padPauseBtn.addEventListener("pointerdown", handlePauseToggle);
      }
    }

    /**
     * Automatically pauses the game if document becomes hidden.
     */
    bindVisibility() {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden && this.game.state === "running") {
          this.game.pause();
        }
      });
    }
  }

  window.MadSnake.InputHandler = InputHandler;
})(window);
