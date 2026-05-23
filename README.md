# Playground — 20 browser games (GitHub Pages)

Pure **HTML, CSS, and JavaScript**. No build step. Host free on GitHub Pages.

## Games (20)

| Game | Type |
|------|------|
| Classic Snake | Arcade |
| XOX (Tic Tac Toe) | Board |
| Chess | Strategy |
| Carrom Board | Physics board |
| Sky Flap | Runner |
| 2048 | Puzzle |
| Connect Four | Board |
| Minesweeper | Puzzle |
| Simon Says | Memory |
| Whack Rush | Arcade |
| Star Blaster | Shooter |
| Slide Puzzle | Puzzle |
| Reaction Test | Reflex |
| Rock Paper Scissors | Casual |
| Meteor Dodge | Action |
| Tap Dash | Runner |
| Color Merge | Merge |
| Brick Breaker | Arcade |
| Memory Match | Cards |
| Neon Pong | Multiplayer |

## GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages →** branch `main`, folder **`/ (root)`**.
3. Open `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## Features in every game

| Feature | Description |
|---------|-------------|
| Score | Live score in the HUD bar |
| Best | High score saved in your browser |
| Play | Start or resume |
| Pause | Freeze the game (or **P** key) |
| Reset | Restart from scratch |
| Lobby | ← back to all games |

## Verify all 20 games

```powershell
py -3 scripts/verify-games.py
```

## Local preview

```powershell
cd path\to\deno
py -3 -m http.server 8787
```

Open http://localhost:8787 (required — ES modules need HTTP).

## Add a game

1. Copy `games/template/` → `games/my-game/`
2. Edit `index.html` and `game.js`
3. Add entry to `games.manifest.json`
4. Add emoji in `js/app.js` → `ICONS` (optional)
5. Push to GitHub

## Structure

```
index.html          ← lobby
css/styles.css
js/app.js
games.manifest.json
shared/             ← shared UI + canvas helpers
games/
  template/
  snake/
  xox/
  chess/
  carrom/
  ...
```
