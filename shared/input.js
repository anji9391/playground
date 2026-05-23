const keys = new Set();

window.addEventListener("keydown", (e) => {
  keys.add(e.key.toLowerCase());
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

export function isDown(key) {
  return keys.has(key.toLowerCase());
}

export function bindTap(handler) {
  const onTap = (e) => {
    if (e.type === "keydown" && e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    handler();
  };
  window.addEventListener("pointerdown", onTap);
  window.addEventListener("keydown", onTap);
  return () => {
    window.removeEventListener("pointerdown", onTap);
    window.removeEventListener("keydown", onTap);
  };
}
