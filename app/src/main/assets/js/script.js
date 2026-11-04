(function () {
  "use strict";

  /**
   * Application bootstrap initializing the MadSnake game engine.
   */
  function init() {
    if (window.MadSnake && window.MadSnake.SnakeGame) {
      const game = new window.MadSnake.SnakeGame();
      game.init();
      window.MadSnake.game = game;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
