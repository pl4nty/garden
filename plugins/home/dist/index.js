// src/components/Home.tsx
import { getDate, resolveRelative } from "@quartz-community/utils";

// ../note-plant/src/components/plant.ts
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

// ../note-plant/src/components/stats.ts
import { simplifySlug } from "@quartz-community/utils";
function noteStats(file, allFiles) {
  const here = simplifySlug(file.slug ?? "");
  const pages = new Set(allFiles.map((f) => simplifySlug(f.slug ?? "")));
  const linksOut = new Set(
    (file.links ?? []).filter((link) => link !== here && pages.has(link))
  ).size;
  const linksIn = allFiles.filter(
    (f) => f.slug !== file.slug && (f.links ?? []).includes(here)
  ).length;
  const words = (file.text ?? "").split(/\s+/).filter(Boolean).length;
  return { words, linksOut, linksIn };
}

// ../shared/smallCaps.tsx
import { jsx } from "preact/jsx-runtime";
var ACRONYM = /\b[A-Z]{2,}s?\b/g;
function smallCaps(text) {
  const out = [];
  let last = 0;
  for (const match of text.matchAll(ACRONYM)) {
    if (match.index > last) out.push(text.slice(last, match.index));
    out.push(/* @__PURE__ */ jsx("abbr", { class: "sc", children: match[0] }));
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// src/components/styles/home.scss
var home_default = ".home-bed{display:flex;align-items:flex-end;justify-content:space-between;gap:2px;height:8rem;overflow:hidden;border-bottom:1px solid var(--dark);color:var(--dark)}.home-bed a{flex:none;display:block;color:inherit;transition:color .15s ease}.home-bed a:hover{color:var(--secondary)}.home-bed svg{display:block;width:100%;height:100%;overflow:visible}@media(max-width: 800px){.home-bed{height:6rem;justify-content:flex-start;gap:6px}}.home-contents section{margin-top:2.75rem}.home-contents h2{margin:0 0 .5rem;font-size:1rem;font-weight:400;font-variant-caps:all-small-caps;letter-spacing:.06em;color:var(--gray)}.home-contents ol{margin:0;padding:0;list-style:none}.home-contents li{display:flex;align-items:baseline;gap:.5rem;margin:0;padding:.16rem 0}.home-contents a{color:var(--dark);background-color:rgba(0,0,0,0);text-decoration:none}.home-contents a:hover{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.home-contents .home-dots{flex:1;min-width:1rem;border-bottom:1px dotted var(--underline, var(--gray));transform:translateY(-0.28em)}.home-contents time{color:var(--gray);white-space:nowrap}.home-contents p{margin:.8rem 0 0;font-style:italic}.home-contents p a{text-decoration:underline;text-decoration-color:var(--underline, var(--gray));text-decoration-thickness:1px;text-underline-offset:.16em}";

// src/components/Home.tsx
import { jsx as jsx2, jsxs } from "preact/jsx-runtime";
var defaultOptions = {
  section: "contents",
  postsFolder: "posts",
  notesFolder: "notes",
  plants: 22,
  recentCount: 6
};
var Home_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const postsPrefix = `${options.postsFolder.replace(/\/$/, "")}/`;
  const notesPrefix = `${options.notesFolder.replace(/\/$/, "")}/`;
  const Home = ({
    fileData,
    allFiles,
    cfg,
    displayClass
  }) => {
    if (fileData.slug !== "index") return null;
    const locale = cfg.locale || "en-US";
    const cfgDateType = cfg.defaultDateType;
    const dateOf = (f) => {
      const data = { ...f, defaultDateType: f.defaultDateType ?? cfgDateType };
      return data.defaultDateType ? getDate(data) : void 0;
    };
    const href = (slug) => resolveRelative(fileData.slug, slug);
    const title = (f) => f.frontmatter?.title ?? f.slug ?? "";
    const month = (d) => d.toLocaleDateString(locale, { month: "short", year: "numeric" });
    const newestFirst = (prefix) => allFiles.filter((f) => f.slug?.startsWith(prefix) && !f.slug.endsWith("/index")).map((f) => ({ f, date: dateOf(f) })).filter((n) => Boolean(n.date)).sort((a, b) => b.date.getTime() - a.date.getTime());
    const notes = newestFirst(notesPrefix);
    if (options.section === "bed") {
      return /* @__PURE__ */ jsx2("nav", { class: `home-bed ${displayClass ?? ""}`, "aria-label": "Recently tended notes", children: notes.slice(0, options.plants).map(({ f, date }) => {
        const plant = drawPlant({ seed: f.slug, ...noteStats(f, allFiles) });
        return /* @__PURE__ */ jsx2(
          "a",
          {
            href: href(f.slug),
            title: `${title(f)} \xB7 ${month(date)}`,
            "aria-label": title(f),
            style: `aspect-ratio:${plant.width}/${plant.height};height:${Math.round(plant.height / 280 * 100)}%`,
            dangerouslySetInnerHTML: { __html: plant.svg }
          }
        );
      }) });
    }
    const posts = newestFirst(postsPrefix);
    const list = (items) => /* @__PURE__ */ jsx2("ol", { children: items.map(({ f, date }) => /* @__PURE__ */ jsxs("li", { children: [
      /* @__PURE__ */ jsx2("a", { href: href(f.slug), children: smallCaps(title(f)) }),
      /* @__PURE__ */ jsx2("span", { class: "home-dots" }),
      /* @__PURE__ */ jsx2("time", { datetime: date.toISOString(), children: month(date) })
    ] })) });
    return /* @__PURE__ */ jsxs("div", { class: `home-contents ${displayClass ?? ""}`, children: [
      posts.length > 0 && /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx2("h2", { children: "Writing" }),
        list(posts)
      ] }),
      notes.length > 0 && /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx2("h2", { children: "Lately tended" }),
        list(notes.slice(0, options.recentCount)),
        /* @__PURE__ */ jsx2("p", { children: /* @__PURE__ */ jsxs("a", { href: href(`${notesPrefix}index`), children: [
          "The index of all ",
          notes.length,
          " notes"
        ] }) })
      ] })
    ] });
  };
  Home.css = home_default;
  return Home;
});
export {
  Home_default as Home
};
