/** @typedef {{ update: (dt: number) => void, draw: () => void }} Game */

/**
 * @param {Game} game
 * @param {HTMLCanvasElement} canvas
 */
export function startLoop(game, canvas) {
  const ctx = canvas.getContext("2d");
  let last = performance.now();
  let running = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!game.paused) game.update(dt);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(ctx, canvas.clientWidth, canvas.clientHeight);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  return {
    stop() {
      running = false;
    },
  };
}
