(function (window) {
  "use strict";

  window.MadSnake = window.MadSnake || {};

  /**
   * FoodManager handles spawning, maintaining target count, and collision
   * detection for multiple food items simultaneously across the board.
   */
  class FoodManager {
    /**
     * @param {number} gridSize - Grid dimensions (NxN cells)
     */
    constructor(gridSize = 20) {
      this.gridSize = gridSize;
      this.foods = [];
    }

    /**
     * Resets the foods list and spawns up to targetCount foods.
     * @param {number} targetCount
     * @param {function(number, number): boolean} isOccupiedFn - Callback to test if cell is occupied
     */
    reset(targetCount, isOccupiedFn) {
      this.foods = [];
      for (let i = 0; i < targetCount; i++) {
        this.spawnOne(isOccupiedFn);
      }
    }

    /**
     * Attempts to spawn a single food at a random unoccupied cell.
     * @param {function(number, number): boolean} isOccupiedFn
     * @returns {boolean} Whether food was successfully spawned
     */
    spawnOne(isOccupiedFn) {
      const maxCells = this.gridSize * this.gridSize;
      if (this.foods.length >= maxCells) return false;

      let attempts = 0;
      let pos;

      do {
        pos = {
          x: Math.floor(Math.random() * this.gridSize),
          y: Math.floor(Math.random() * this.gridSize),
        };
        attempts++;
        if (attempts > 1200) return false;
      } while (isOccupiedFn(pos.x, pos.y) || this.occupies(pos.x, pos.y));

      this.foods.push(pos);
      return true;
    }

    /**
     * Checks if a coordinate is occupied by any food.
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    occupies(x, y) {
      return this.foods.some((f) => f.x === x && f.y === y);
    }

    /**
     * Finds the index of a food at coordinates (x, y).
     * @param {number} x
     * @param {number} y
     * @returns {number} Index, or -1 if not found
     */
    findIndexAt(x, y) {
      return this.foods.findIndex((f) => f.x === x && f.y === y);
    }

    /**
     * Consumes the food at the given index and spawns a replacement food.
     * @param {number} index
     * @param {function(number, number): boolean} isOccupiedFn
     */
    consumeAt(index, isOccupiedFn) {
      if (index >= 0 && index < this.foods.length) {
        this.foods.splice(index, 1);
        this.spawnOne(isOccupiedFn);
      }
    }

    getAll() {
      return this.foods;
    }

    getCount() {
      return this.foods.length;
    }
  }

  window.MadSnake.FoodManager = FoodManager;
})(window);
