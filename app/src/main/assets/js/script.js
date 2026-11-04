(function () {
  var N = 20,
    C = document.getElementById("c"),
    X = C.getContext("2d"),
    S = C.width / N;
  var scEl = document.getElementById("sc"),
    hiEl = document.getElementById("hi");
  var snake,
    dir,
    queue,
    food,
    score,
    speed,
    timer,
    state = "ready",
    hi = 0,
    flash = 0,
    actx = null;
  try {
    hi = parseInt(localStorage.getItem("madsnake-hi") || "0", 10) || 0;
  } catch (e) {}
  hiEl.textContent = hi;
  function css(v) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(v)
      .trim();
  }
  function beep(f, d) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(),
        g = actx.createGain();
      o.type = "square";
      o.frequency.value = f;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(actx.destination);
      o.start();
      o.stop(actx.currentTime + d);
    } catch (e) {}
  }
  function reset() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dir = "R";
    queue = [];
    score = 0;
    speed = 140;
    scEl.textContent = 0;
    placeFood();
  }
  function placeFood() {
    var f;
    do {
      f = {
        x: Math.floor(Math.random() * N),
        y: Math.floor(Math.random() * N),
      };
    } while (
      snake.some(function (s) {
        return s.x === f.x && s.y === f.y;
      })
    );
    food = f;
  }
  var V = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] },
    OPP = { U: "D", D: "U", L: "R", R: "L" };
  function turn(d) {
    if (state === "ready" || state === "over") {
      start();
    }
    var last = queue.length ? queue[queue.length - 1] : dir;
    if (d !== last && d !== OPP[last] && queue.length < 3) queue.push(d);
  }
  function start() {
    if (state === "running") return;
    reset();
    state = "running";
    loop();
  }
  function loop() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      step();
      if (state === "running") loop();
    }, speed);
  }
  function step() {
    if (queue.length) dir = queue.shift();
    var h = snake[0],
      v = V[dir],
      n = { x: (h.x + v[0] + N) % N, y: (h.y + v[1] + N) % N }; // walls wrap around
    if (
      snake.some(function (s, i) {
        return i < snake.length - 1 && s.x === n.x && s.y === n.y;
      })
    ) {
      return die();
    }
    snake.unshift(n);
    if (n.x === food.x && n.y === food.y) {
      score += 10;
      scEl.textContent = score;
      speed = Math.max(45, speed - 6); // gets madder
      beep(880, 0.08);
      placeFood();
    } else snake.pop();
    draw();
  }
  function die() {
    state = "over";
    beep(120, 0.4);
    flash = 6;
    if (score > hi) {
      hi = score;
      hiEl.textContent = hi;
      try {
        localStorage.setItem("madsnake-hi", String(hi));
      } catch (e) {}
    }
    draw();
  }
  function px(x, y, fill) {
    X.fillStyle = fill;
    X.fillRect(x * S + 1, y * S + 1, S - 2, S - 2);
    X.clearRect(x * S + 4, y * S + 4, S - 8, S - 8);
    X.fillRect(x * S + 5, y * S + 5, S - 10, S - 10);
  }
  function draw() {
    var ink = css("--ink"),
      lcd = css("--lcd");
    X.fillStyle = lcd;
    X.fillRect(0, 0, C.width, C.height);
    // faint grid like an LCD
    X.fillStyle = "rgba(0,0,0,.05)";
    for (var i = 0; i < N; i++)
      for (var j = 0; j < N; j++)
        X.fillRect(i * S + S / 2 - 1, j * S + S / 2 - 1, 2, 2);
    px(food.x, food.y, ink);
    X.clearRect(food.x * S + S / 2 - 3, food.y * S + S / 2 - 3, 6, 6);
    X.fillStyle = lcd;
    X.fillRect(food.x * S + S / 2 - 3, food.y * S + S / 2 - 3, 6, 6);
    snake.forEach(function (s, i) {
      X.fillStyle = ink;
      X.fillRect(s.x * S + 2, s.y * S + 2, S - 4, S - 4);
      if (i === 0) {
        X.fillStyle = lcd;
        X.fillRect(s.x * S + S / 2 - 2, s.y * S + S / 2 - 2, 4, 4);
      }
    });
    if (state === "ready" || state === "over" || state === "paused") {
      X.fillStyle = ink;
      X.textAlign = "center";
      X.font = 'bold 34px "Courier New",monospace';
      var big =
        state === "over"
          ? "GAME OVER"
          : state === "paused"
            ? "PAUSED"
            : "MAD SNAKE";
      X.fillText(big, C.width / 2, C.height / 2 - 8);
      X.font = 'bold 16px "Courier New",monospace';
      X.fillText(
        state === "paused" ? "Space to resume" : "Press any arrow to start",
        C.width / 2,
        C.height / 2 + 22,
      );
    }
    if (flash > 0) {
      flash--;
      X.fillStyle = ink;
      X.globalAlpha = flash % 2 ? 0.35 : 0;
      X.fillRect(0, 0, C.width, C.height);
      X.globalAlpha = 1;
      if (flash > 0) setTimeout(draw, 90);
    }
  }
  function pause() {
    if (state === "running") {
      state = "paused";
      clearTimeout(timer);
      draw();
    } else if (state === "paused") {
      state = "running";
      loop();
    } else start();
  }
  document.addEventListener("keydown", function (e) {
    var k = e.key,
      m = {
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
    if (m[k]) {
      e.preventDefault();
      if (state !== "paused") turn(m[k]);
    } else if (k === " " || k === "p" || k === "P") {
      e.preventDefault();
      pause();
    } else if (k === "Enter" && state !== "running") {
      start();
    }
  });
  Array.prototype.forEach.call(
    document.querySelectorAll(".pad button"),
    function (b) {
      b.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        turn(b.getAttribute("data-d"));
      });
    },
  );
  // swipe
  var sx, sy;
  document.addEventListener(
    "touchstart",
    function (e) {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    },
    { passive: true },
  );
  document.addEventListener("touchend", function (e) {
    if (sx == null) return;
    var t = e.changedTouches[0],
      dx = t.clientX - sx,
      dy = t.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) {
      if (state !== "running") start();
      sx = null;
      return;
    }
    turn(
      Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "R" : "L") : dy > 0 ? "D" : "U",
    );
    sx = null;
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && state === "running") pause();
  });
  reset();
  draw();
})();
