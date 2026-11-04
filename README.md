# 🐍 Mad Snake

A classic Nokia-style snake game. It speeds up every time you eat, and the snake can pass through walls. Runs in any browser and as an Android app.

## Play

- **In a browser:** open `app/src/main/assets/index.html` by double-clicking it. No install or internet needed.
- **On Android:** download the latest `MadSnake-*.apk` from the [Releases](../../releases) page and install it. You may need to allow installs from unknown sources.

## Controls

| Action | Keys / touch |
| --- | --- |
| Steer | Arrow keys or WASD, swipe, or on-screen D-pad |
| Start | Enter, Space, or tap "START GAME" |
| Difficulty | Left / Right arrows or tap Easy / Normal / Hard buttons |
| Pause / resume | Space, P, or tap the `⏸` button |

## Rules

- Multiple foods spawn across the map simultaneously (Easy: 5, Normal: 4, Hard: 3).
- Eat any food to score 10 points. The snake gets faster with each one.
- Walls wrap around: leave one side and you come out the opposite side.
- The game ends if the snake hits its own tail.
- Your high score is saved per difficulty on your device.

## Build the APK yourself

You need Android Studio.

1. Clone this repository and open it in Android Studio.
2. Wait for the Gradle sync to finish.
3. Choose **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
4. The APK is at `app/build/outputs/apk/debug/app-debug.apk`.

## Automatic releases

A GitHub Action (`.github/workflows/release.yml`) builds the APK and attaches it to a release whenever you push a version tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Project structure

```
app/src/main/assets/index.html          the game (HTML, CSS)
app/src/main/assets/js/                 modular OOP game engine
  config.js                             difficulty definitions and max speed caps
  snake.js                              snake domain model & direction queuing
  food.js                               multi-food spawning & consumption manager
  renderer.js                           Nokia LCD canvas renderer & flash effects
  ui.js                                 menus, overlays & HUD controller
  input.js                              keyboard, touch/swipe & D-pad bindings
  sound.js                              8-bit Web Audio sound effects
  storage.js                            difficulty & high-score persistence
  game.js                               SnakeGame central engine & game loop
  script.js                             bootstrap entry point
app/src/main/java/.../MainActivity.kt   WebView that opens the game
.github/workflows/release.yml           builds and publishes the APK
```

## License

Free to use and modify.
