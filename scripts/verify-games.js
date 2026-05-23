/** Run with: node scripts/verify-games.js  (or open in browser console) */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "games.manifest.json"), "utf8"));
let ok = 0;
let fail = 0;

for (const g of manifest.games) {
  const html = join(root, g.path);
  const dir = dirname(html);
  const js = join(dir, "game.js");
  const issues = [];
  if (!existsSync(html)) issues.push("missing index.html");
  if (!existsSync(js)) issues.push("missing game.js");
  if (issues.length) {
    console.log(`FAIL ${g.id}: ${issues.join(", ")}`);
    fail++;
  } else {
    console.log(`OK   ${g.id}`);
    ok++;
  }
}

console.log(`\n${ok} ok, ${fail} failed, ${manifest.games.length} in manifest`);
process.exit(fail > 0 ? 1 : 0);
