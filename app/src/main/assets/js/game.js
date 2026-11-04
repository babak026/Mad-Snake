(function (window) {
  "use strict";

  window.MadSnake = window.MadSnake || {};

  const {
    DifficultyConfig,
    SoundManager,
    ScoreStorage,
    Snake,
    FoodManager,
    Renderer,
    UIManager,
    InputHandler,
  } = window.MadSnake;

  /**
   * SnakeGame is the central engine orchestrating domain models,
   * graphics rendering, audio, UI, user inputs, and difficulty configurations.
   */
  class SnakeGame {
    static GRID_SIZE = 20;

    static STATE = {
      MENU: "menu",
      RUNNING: "running",
      PAUSED: "paused",
      OVER: "over",
    };

    constructor() {
      this.gridSize = SnakeGame.GRID_SIZE;
      this.state = SnakeGame.STATE.MENU;

      // Subsystems
      this.sound = new SoundManager();
      this.snake = new Snake(this.gridSize);
      this.food = new FoodManager(this.gridSize);
      this.renderer = new Renderer(document.getElementById("c"), this.gridSize);
      this.ui = new UIManager();
      this.input = new InputHandler(this);

      // Game state variables
      this.currentDiff = ScoreStorage.getSavedDifficulty(
        DifficultyConfig.DEFAULT_KEY,
      );
      this.score = 0;
      this.highScore = 0;
      this.speed = 135;
      this.timer = null;
    }

    /**
     * Bootstraps the game subsystems, binds inputs, and presents the main menu.
     */
    init() {
      this.input.bindAll();
      this.setDifficulty(this.currentDiff, false);
      this.returnToMenu();
    }

    /**
     * Gets the active difficulty config object.
     * @returns {object}
     */
    getDifficultyConfig() {
      return DifficultyConfig.get(this.currentDiff);
    }

    /**
     * Sets the active difficulty, updating food count, speeds, and high scores.
     * @param {string} diffKey
     * @param {boolean} refreshPreview - Whether to respawn preview foods and redraw
     */
    setDifficulty(diffKey, refreshPreview = true) {
      if (!DifficultyConfig.isValid(diffKey)) return;

      this.currentDiff = diffKey;
      ScoreStorage.saveDifficulty(diffKey);

      const config = this.getDifficultyConfig();
      this.highScore = ScoreStorage.getHighScore(diffKey);

      this.ui.updateDifficulty(this.currentDiff, config, this.highScore);

      if (refreshPreview && this.state === SnakeGame.STATE.MENU) {
        this.resetBoardState();
        this.renderer.render(this.snake.getBody(), this.food.getAll());
      }
    }

    /**
     * Cycles to adjacent difficulty level.
     * @param {number} direction
     */
    cycleDifficulty(direction) {
      const nextDiff = DifficultyConfig.getNext(this.currentDiff, direction);
      this.setDifficulty(nextDiff);
      this.sound.playClick();
    }

    /**
     * Resets snake, score, and multi-food targets according to active difficulty.
     */
    resetBoardState() {
      const config = this.getDifficultyConfig();
      this.snake.reset(10, 10, 3, "R");
      this.score = 0;
      this.speed = config.initialSpeed;
      this.ui.updateScore(this.score);

      // Spawn target count of foods without overlapping snake or existing food
      this.food.reset(config.foodCount, (x, y) => this.snake.occupies(x, y));
    }

    /**
     * Shows the Main Menu and resets the preview board.
     */
    returnToMenu() {
      this.state = SnakeGame.STATE.MENU;
      clearTimeout(this.timer);
      this.resetBoardState();
      this.highScore = ScoreStorage.getHighScore(this.currentDiff);
      this.ui.showMenu(this.highScore);
      this.renderer.render(this.snake.getBody(), this.food.getAll());
    }

    /**
     * Starts a new game session.
     */
    start() {
      clearTimeout(this.timer);
      this.resetBoardState();
      this.ui.hideOverlays();
      this.state = SnakeGame.STATE.RUNNING;
      this.sound.playStart();
      this.runLoop();
    }

    /**
     * Pauses an active game session.
     */
    pause() {
      if (this.state !== SnakeGame.STATE.RUNNING) return;
      this.state = SnakeGame.STATE.PAUSED;
      clearTimeout(this.timer);
      this.sound.playPause();
      this.ui.showPause(this.score, this.getDifficultyConfig().name);
      this.renderer.render(this.snake.getBody(), this.food.getAll());
    }

    /**
     * Resumes a paused game session.
     */
    resume() {
      if (this.state !== SnakeGame.STATE.PAUSED) return;
      this.ui.hideOverlays();
      this.state = SnakeGame.STATE.RUNNING;
      this.sound.playResume();
      this.runLoop();
    }

    /**
     * Main game loop scheduling.
     */
    runLoop() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.step();
        if (this.state === SnakeGame.STATE.RUNNING) {
          this.runLoop();
        }
      }, this.speed);
    }

    /**
     * Advances the game simulation by one tick.
     */
    step() {
      const nextHead = this.snake.computeNextHead();

      // Check self-collision
      if (this.snake.checkSelfCollision(nextHead)) {
        this.die();
        return;
      }

      // Check food consumption
      const eatenIndex = this.food.findIndexAt(nextHead.x, nextHead.y);
      const isFoodEaten = eatenIndex !== -1;

      // Advance snake (grow if food eaten)
      this.snake.advance(nextHead, isFoodEaten);

      if (isFoodEaten) {
        this.score += 10;
        this.ui.updateScore(this.score);

        // Accelerate and enforce maxSpeed limit
        const config = this.getDifficultyConfig();
        this.speed = Math.max(config.maxSpeed, this.speed - config.speedStep);

        this.sound.playEat();

        // Remove eaten food and spawn a new replacement food
        this.food.consumeAt(eatenIndex, (x, y) => this.snake.occupies(x, y));
      }

      this.renderer.render(this.snake.getBody(), this.food.getAll());
    }

    /**
     * Handles game over sequence, records high score, and shows game over screen.
     */
    die() {
      this.state = SnakeGame.STATE.OVER;
      clearTimeout(this.timer);
      this.sound.playDie();

      let isNewRecord = false;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        ScoreStorage.saveHighScore(this.currentDiff, this.highScore);
        this.ui.updateHighScore(this.highScore);
        isNewRecord = true;
      }

      this.renderer.render(this.snake.getBody(), this.food.getAll());

      // Trigger flash animation then display Game Over screen
      this.renderer.flash(6, () => {
        const diffName = this.getDifficultyConfig().name;
        this.ui.showGameOver(this.score, this.highScore, diffName, isNewRecord);
      });
    }
  }

  window.MadSnake.SnakeGame = SnakeGame;
})(window);
