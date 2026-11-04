(function (window) {
  "use strict";

  window.MadSnake = window.MadSnake || {};

  /**
   * Snake encapsulates the snake state, movement, direction buffering,
   * wrap-around geometry, and collision checking.
   */
  class Snake {
    static VECTORS = {
      U: [0, -1],
      D: [0, 1],
      L: [-1, 0],
      R: [1, 0],
    };

    static OPPOSITE = {
      U: "D",
      D: "U",
      L: "R",
      R: "L",
    };

    /**
     * @param {number} gridSize - Grid dimensions (NxN cells)
     */
    constructor(gridSize = 20) {
      this.gridSize = gridSize;
      this.body = [];
      this.direction = "R";
      this.queue = [];
      this.reset();
    }

    /**
     * Resets snake to its default position and direction.
     * @param {number} startX
     * @param {number} startY
     * @param {number} length
     * @param {string} initialDir
     */
    reset(startX = 10, startY = 10, length = 3, initialDir = "R") {
      this.direction = initialDir;
      this.queue = [];
      this.body = [];
      for (let i = 0; i < length; i++) {
        this.body.push({ x: startX - i, y: startY });
      }
    }

    /**
     * Queues a new direction if it is valid (not reverse and buffer not full).
     * @param {string} newDir - 'U', 'D', 'L', or 'R'
     */
    queueDirection(newDir) {
      if (!Snake.VECTORS[newDir]) return;
      const last = this.queue.length
        ? this.queue[this.queue.length - 1]
        : this.direction;
      if (
        newDir !== last &&
        newDir !== Snake.OPPOSITE[last] &&
        this.queue.length < 3
      ) {
        this.queue.push(newDir);
      }
    }

    /**
     * Computes the next head position based on current or queued direction,
     * applying wrap-around on walls.
     * @returns {{x: number, y: number}}
     */
    computeNextHead() {
      if (this.queue.length > 0) {
        this.direction = this.queue.shift();
      }
      const head = this.body[0];
      const vec = Snake.VECTORS[this.direction];
      const n = this.gridSize;

      return {
        x: (head.x + vec[0] + n) % n,
        y: (head.y + vec[1] + n) % n,
      };
    }

    /**
     * Checks if the given head position collides with the snake's body.
     * @param {{x: number, y: number}} nextHead
     * @returns {boolean}
     */
    checkSelfCollision(nextHead) {
      // Last segment moves away on non-growth steps, but colliding with any prior segment ends game
      return this.body.some(
        (segment, idx) =>
          idx < this.body.length - 1 &&
          segment.x === nextHead.x &&
          segment.y === nextHead.y,
      );
    }

    /**
     * Advances the snake by prepending the new head and conditionally popping the tail.
     * @param {{x: number, y: number}} nextHead
     * @param {boolean} grow
     */
    advance(nextHead, grow = false) {
      this.body.unshift(nextHead);
      if (!grow) {
        this.body.pop();
      }
    }

    /**
     * Checks if a coordinate is occupied by any snake segment.
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    occupies(x, y) {
      return this.body.some((segment) => segment.x === x && segment.y === y);
    }

    getHead() {
      return this.body[0];
    }

    getBody() {
      return this.body;
    }

    getLength() {
      return this.body.length;
    }
  }

  window.MadSnake.Snake = Snake;
})(window);
