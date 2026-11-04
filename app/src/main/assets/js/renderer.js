(function (window) {
  'use strict';

  window.MadSnake = window.MadSnake || {};

  /**
   * Renderer manages HTML5 Canvas 2D rendering in retro Nokia LCD aesthetic.
   */
  class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {number} gridSize
     */
    constructor(canvas, gridSize = 20) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.gridSize = gridSize;
      this.cellSize = canvas.width / gridSize;
    }

    /**
     * Reads a computed CSS variable color from root.
     * @param {string} varName
     * @returns {string}
     */
    getCssColor(varName) {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
    }

    /**
     * Draws an LCD pixel block.
     * @param {number} x
     * @param {number} y
     * @param {string} fill
     */
    drawPixel(x, y, fill) {
      const s = this.cellSize;
      this.ctx.fillStyle = fill;
      this.ctx.fillRect(x * s + 1, y * s + 1, s - 2, s - 2);
      this.ctx.clearRect(x * s + 4, y * s + 4, s - 8, s - 8);
      this.ctx.fillRect(x * s + 5, y * s + 5, s - 10, s - 10);
    }

    /**
     * Clears canvas and renders the faint LCD background dot matrix.
     * @param {string} lcdColor
     */
    drawBackground(lcdColor) {
      const w = this.canvas.width;
      const h = this.canvas.height;
      const s = this.cellSize;

      this.ctx.fillStyle = lcdColor;
      this.ctx.fillRect(0, 0, w, h);

      // Faint LCD pixel matrix dots
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          this.ctx.fillRect(i * s + s / 2 - 1, j * s + s / 2 - 1, 2, 2);
        }
      }
    }

    /**
     * Renders all active food items on the board.
     * @param {Array<{x: number, y: number}>} foods
     * @param {string} inkColor
     * @param {string} lcdColor
     */
    drawFoods(foods, inkColor, lcdColor) {
      const s = this.cellSize;
      for (let i = 0; i < foods.length; i++) {
        const f = foods[i];
        this.drawPixel(f.x, f.y, inkColor);
        this.ctx.clearRect(f.x * s + s / 2 - 3, f.y * s + s / 2 - 3, 6, 6);
        this.ctx.fillStyle = lcdColor;
        this.ctx.fillRect(f.x * s + s / 2 - 3, f.y * s + s / 2 - 3, 6, 6);
      }
    }

    /**
     * Renders snake body and head eye.
     * @param {Array<{x: number, y: number}>} body
     * @param {string} inkColor
     * @param {string} lcdColor
     */
    drawSnake(body, inkColor, lcdColor) {
      const s = this.cellSize;
      for (let i = 0; i < body.length; i++) {
        const seg = body[i];
        this.ctx.fillStyle = inkColor;
        this.ctx.fillRect(seg.x * s + 2, seg.y * s + 2, s - 4, s - 4);
        if (i === 0) {
          // Hollow eye for head
          this.ctx.fillStyle = lcdColor;
          this.ctx.fillRect(seg.x * s + s / 2 - 2, seg.y * s + s / 2 - 2, 4, 4);
        }
      }
    }

    /**
     * Complete render pass for snake and foods.
     * @param {Array<{x: number, y: number}>} snakeBody
     * @param {Array<{x: number, y: number}>} foods
     */
    render(snakeBody, foods) {
      const ink = this.getCssColor('--ink');
      const lcd = this.getCssColor('--lcd');

      this.drawBackground(lcd);
      this.drawFoods(foods, ink, lcd);
      this.drawSnake(snakeBody, ink, lcd);
    }

    /**
     * Triggers a flashing death animation.
     * @param {number} totalFrames
     * @param {function} onComplete
     */
    flash(totalFrames = 6, onComplete = null) {
      let remaining = totalFrames;
      const step = () => {
        if (remaining <= 0) {
          if (onComplete) onComplete();
          return;
        }
        remaining--;
        const ink = this.getCssColor('--ink');
        this.ctx.fillStyle = ink;
        this.ctx.globalAlpha = remaining % 2 ? 0.35 : 0;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1;
        setTimeout(step, 90);
      };
      step();
    }
  }

  window.MadSnake.Renderer = Renderer;
})(window);
