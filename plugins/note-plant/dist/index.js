// src/components/NotePlant.tsx
import { formatDate, getDate, simplifySlug } from "@quartz-community/utils";

// src/components/plant.ts
var MAX_LEAVES = 10;
var MAX_BUDS = 8;
var LEVEL = 22;
var WIDTH = 200;
function random(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var r = (n) => Math.round(n * 10) / 10;
var pt = (p) => `${r(p[0])} ${r(p[1])}`;
var minX = Infinity;
var maxX = -Infinity;
var seen = (...points) => {
  for (const [x] of points) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
  }
};
var path = (points) => {
  seen(...points);
  return `<path class="t" d="M${points.map(pt).join("L")}"/>`;
};
function leaf(base, dir, len) {
  const n = Math.hypot(dir[0], dir[1]);
  const [ux, uy] = [dir[0] / n, dir[1] / n];
  const [px, py] = [-uy, ux];
  const w = len * 0.34;
  const tip = [base[0] + ux * len, base[1] + uy * len];
  const c1 = [base[0] + ux * len * 0.45 + px * w, base[1] + uy * len * 0.45 + py * w];
  const c2 = [base[0] + ux * len * 0.45 - px * w, base[1] + uy * len * 0.45 - py * w];
  const rib = [base[0] + ux * len * 0.62, base[1] + uy * len * 0.62];
  seen(tip, c1, c2);
  return `<path class="f" d="M${pt(base)}Q${pt(c1)} ${pt(tip)}Q${pt(c2)} ${pt(base)}Z"/><path class="r" d="M${pt(base)}L${pt(rib)}"/>`;
}
function drawPlant({ seed, words, linksOut, linksIn }) {
  const rand = random(seed);
  minX = Infinity;
  maxX = -Infinity;
  const leaves = Math.min(linksOut, MAX_LEAVES);
  const buds = Math.min(linksIn, MAX_BUDS);
  const fromWords = Math.max(1, Math.min(7, Math.round(Math.log2(Math.max(words, 60) / 60))));
  const levels = Math.max(fromWords, Math.ceil((leaves + buds) / 2));
  const slots = Array.from({ length: levels }, () => [void 0, void 0]);
  let side = rand() < 0.5 ? 0 : 1;
  const spread = Math.max(1, Math.floor(levels * 2 / Math.max(leaves, 1)));
  for (let i = 0, at = 0; i < leaves; i++, at += spread) {
    let level = Math.min(Math.floor(at / 2), levels - 1);
    while (slots[level][side] !== void 0) {
      side = 1 - side;
      if (slots[level][side] !== void 0) level = (level + 1) % levels;
    }
    slots[level][side] = "leaf";
    side = 1 - side;
  }
  const free = [];
  slots.forEach((s, level) => s.forEach((v, sd) => v === void 0 && free.push([level, sd])));
  for (let i = 0; i < buds && free.length > 0; i++) {
    const [level, sd] = free.splice(Math.floor(rand() * free.length), 1)[0];
    slots[level][sd] = "bud";
  }
  const top = 34;
  const height = top + levels * LEVEL + 30;
  const baseY = height - 14;
  const cx = WIDTH / 2;
  const traces = [];
  const leafShapes = [];
  const vias = [];
  const budShapes = [];
  let x = cx;
  let y = baseY;
  const stem = [[x, y]];
  y -= 16;
  stem.push([x, y]);
  for (let level = 0; level < levels; level++) {
    const nodeY = y - LEVEL / 2;
    const [left2, right] = slots[level];
    for (const [slot, dir] of [
      [left2, -1],
      [right, 1]
    ]) {
      if (!slot) continue;
      const out = 8 + rand() * 4;
      const elbow = [x + dir * out, nodeY - out];
      if (slot === "leaf") {
        const run = (6 + rand() * 16) * (1 - level / levels * 0.5);
        const end = [elbow[0] + dir * run, elbow[1]];
        traces.push(path([[x, nodeY], elbow, end]));
        leafShapes.push(leaf(end, [dir, -0.35 - rand() * 0.6], 17 + rand() * 7));
      } else {
        traces.push(path([[x, nodeY], elbow]));
        seen([elbow[0] - 5, elbow[1]], [elbow[0] + 5, elbow[1]]);
        budShapes.push(`<circle class="b" cx="${r(elbow[0])}" cy="${r(elbow[1])}" r="3.6"/>`);
      }
    }
    vias.push(`<circle class="v" cx="${r(x)}" cy="${r(nodeY)}" r="2.6"/>`);
    y -= LEVEL;
    stem.push([x, y + 6]);
    const jog = level < levels - 1 && rand() < 0.55 ? rand() < 0.5 ? -6 : 6 : 0;
    const nx = Math.abs(x + jog - cx) > 12 ? x - jog : x + jog;
    if (nx !== x) {
      stem.push([nx, y + 6 - Math.abs(nx - x)]);
      x = nx;
    }
    stem.push([x, y]);
  }
  traces.unshift(path(stem));
  leafShapes.push(leaf([x, y], [0, -1], 20 + Math.min(levels, 5) * 2));
  if (leaves === 0 && buds === 0) {
    const at = [cx, baseY - 12];
    leafShapes.push(leaf(at, [-1, -0.7], 13), leaf(at, [1, -0.7], 13));
  }
  seen([cx - 22, baseY], [cx + 22, baseY]);
  const pads = [-16, 0, 16].map((dx) => `<rect class="p" x="${cx + dx - 4}" y="${baseY}" width="8" height="12" rx="2"/>`).join("");
  const left = Math.floor(minX) - 2;
  const width = Math.ceil(maxX) + 2 - left;
  const svg = `<svg viewBox="${left} 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pads}<g stroke-width="1.75">${traces.join("")}</g><g stroke-width="1.4">${leafShapes.join("")}</g><g stroke-width="1.75">${vias.join("")}${budShapes.join("")}</g></svg>`;
  return { svg, width, height, leaves, buds };
}

// src/components/styles/notePlant.scss
var notePlant_default = ".note-plant{display:flex;align-items:flex-end;gap:.5rem 1.5rem;margin:3.5rem 0 0;border-bottom:1px solid var(--lightgray)}.note-plant figcaption{flex:1;min-width:0;padding-bottom:.9rem;font-family:var(--codeFont);font-size:.75rem;line-height:1.5;color:var(--gray)}.note-plant figcaption p{margin:0;line-height:1.5;color:inherit}.note-plant-tended{color:var(--darkgray)}.note-plant-stats{display:flex;flex-wrap:wrap;gap:0 1.1em;margin-top:.15rem}.note-plant-stats span{white-space:nowrap}.note-plant-key{display:inline-block;width:.5em;height:.5em;margin-right:.45em;border-radius:50%;vertical-align:.08em}.note-plant-key.leaf{background-color:var(--secondary)}.note-plant-key.bud{background-color:var(--tertiary)}.note-plant-art{flex-shrink:0;margin-bottom:-1px;color:var(--secondary)}.note-plant-art svg{display:block;overflow:visible}.note-plant-art .f{fill:currentColor;fill-opacity:.13}.note-plant-art .r{stroke-width:1;opacity:.7}.note-plant-art .v{fill:var(--light)}.note-plant-art .b{fill:var(--tertiary);stroke:var(--tertiary)}.note-plant-art .p{fill:currentColor;fill-opacity:.18;stroke-width:1.25}@media(max-width: 500px){.note-plant{flex-direction:column;align-items:flex-start;border-bottom:0}.note-plant figcaption{width:100%;padding:.75rem 0 0;border-top:1px solid var(--lightgray)}.note-plant-art{margin-bottom:0}}";

// src/components/NotePlant.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var defaultOptions = {
  roots: []
};
var plural = (n, one, many) => `${n.toLocaleString("en")} ${n === 1 ? one : many}`;
var NotePlant_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const roots = options.roots.map((root) => root.replace(/\/$/, "").toLowerCase());
  const NotePlant = ({
    fileData,
    allFiles,
    cfg,
    displayClass
  }) => {
    const slug = fileData.slug ?? "";
    if (!slug || slug === "index" || slug.endsWith("/index") || slug === "404") return null;
    if (slug === "tags" || slug.startsWith("tags/")) return null;
    if (roots.length > 0 && !roots.some((root) => slug.startsWith(`${root}/`))) return null;
    const here = simplifySlug(slug);
    const pages = new Set(allFiles.map((f) => simplifySlug(f.slug ?? "")));
    const linksOut = new Set(
      (fileData.links ?? []).filter((link) => link !== here && pages.has(link))
    ).size;
    const linksIn = allFiles.filter(
      (f) => f.slug !== fileData.slug && (f.links ?? []).includes(here)
    ).length;
    const words = (fileData.text ?? "").split(/\s+/).filter(Boolean).length;
    const plant = drawPlant({ seed: slug, words, linksOut, linksIn });
    const cfgDateType = cfg.defaultDateType;
    const dated = {
      ...fileData,
      defaultDateType: fileData.defaultDateType ?? cfgDateType
    };
    const date = dated.defaultDateType ? getDate(dated) : void 0;
    const description = `A plant drawn from this note. Its height comes from the note's length, it has ${plural(plant.leaves, "leaf", "leaves")} for the notes it links to and ${plural(plant.buds, "bud", "buds")} for the notes that link here.`;
    return /* @__PURE__ */ jsxs("figure", { class: `note-plant ${displayClass ?? ""}`, children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          class: "note-plant-art",
          role: "img",
          "aria-label": description,
          dangerouslySetInnerHTML: { __html: plant.svg }
        }
      ),
      /* @__PURE__ */ jsxs("figcaption", { children: [
        date && /* @__PURE__ */ jsxs("p", { class: "note-plant-tended", children: [
          "Tended",
          " ",
          /* @__PURE__ */ jsx("time", { datetime: date.toISOString(), children: formatDate(date, cfg.locale || "en-US") })
        ] }),
        /* @__PURE__ */ jsxs("p", { class: "note-plant-stats", children: [
          /* @__PURE__ */ jsx("span", { children: plural(words, "word", "words") }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("i", { class: "note-plant-key leaf" }),
            plural(linksOut, "link out", "links out")
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("i", { class: "note-plant-key bud" }),
            plural(linksIn, "link in", "links in")
          ] })
        ] })
      ] })
    ] });
  };
  NotePlant.css = notePlant_default;
  return NotePlant;
});
export {
  NotePlant_default as NotePlant
};
