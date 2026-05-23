const ROOT = new URL("../", import.meta.url);

const grid = document.getElementById("grid");
const search = document.getElementById("search");
const tagsEl = document.getElementById("tags");
const empty = document.getElementById("empty");
const statsEl = document.getElementById("stats");

let allGames = [];
let activeTag = "";

const ICONS = {
  snake: "🐍",
  xox: "✕",
  chess: "♟",
  carrom: "🎯",
  flappy: "🐦",
  "game-2048": "🔢",
  "connect-four": "🔴",
  minesweeper: "💣",
  simon: "🎵",
  whack: "🔨",
  "space-shooter": "🚀",
  "sliding-puzzle": "🧩",
  reaction: "⚡",
  rps: "✊",
  "meteor-dodge": "☄",
  "tap-dash": "🏃",
  "color-merge": "🎨",
  "brick-breaker": "🧱",
  "memory-match": "🃏",
  pong: "🏓",
};

async function loadManifest() {
  const res = await fetch(new URL("games.manifest.json", ROOT));
  const data = await res.json();
  allGames = data.games;
  statsEl.innerHTML = `<strong>${allGames.length}</strong> free games · no install`;
  buildTagFilters();
  render();
}

function buildTagFilters() {
  const tags = [...new Set(allGames.flatMap((g) => g.tags))].sort();
  tagsEl.innerHTML = "";
  const allBtn = makeTagButton("All", "");
  allBtn.classList.add("active");
  tagsEl.append(allBtn);
  for (const tag of tags) {
    tagsEl.append(makeTagButton(tag, tag));
  }
}

function makeTagButton(label, value) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tag";
  btn.textContent = label;
  btn.dataset.tag = value;
  btn.addEventListener("click", () => {
    activeTag = value;
    tagsEl.querySelectorAll(".tag").forEach((t) => {
      t.classList.toggle("active", t.dataset.tag === value);
    });
    render();
  });
  return btn;
}

function render() {
  const q = search.value.trim().toLowerCase();
  const filtered = allGames.filter((g) => {
    const matchesTag = !activeTag || g.tags.includes(activeTag);
    const haystack = `${g.title} ${g.description} ${g.tags.join(" ")}`.toLowerCase();
    const matchesSearch = !q || haystack.includes(q);
    return matchesTag && matchesSearch;
  });

  grid.innerHTML = "";
  for (const game of filtered) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "card";
    a.href = new URL(game.path, ROOT).href;
    a.innerHTML = `
      <div class="card-thumb" style="background: linear-gradient(145deg, ${game.color} 0%, #0f172a 100%)">
        <span style="position:relative;z-index:1">${ICONS[game.id] ?? game.title.slice(0, 1)}</span>
      </div>
      <div class="card-body">
        <h2>${escapeHtml(game.title)}</h2>
        <p>${escapeHtml(game.description)}</p>
      </div>
    `;
    li.append(a);
    grid.append(li);
  }

  empty.classList.toggle("hidden", filtered.length > 0);
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

search.addEventListener("input", render);
loadManifest();
