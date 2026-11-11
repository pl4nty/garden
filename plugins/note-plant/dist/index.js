// src/components/plant.ts
var FOOT = 8;
var FILL_ORDER = ["d", "c", "b", "a", "k", "h", "p1", "p2", "p3", "y"];
var STROKE_ORDER = ["w", "s", "t"];
var MAX_OUT = 8;
var MAX_IN = 6;
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
function nums(...values) {
  let out = "";
  for (const v of values) {
    const s = String(Math.round(v * 10) / 10);
    out += out && !s.startsWith("-") ? ` ${s}` : s;
  }
  return out;
}
var Drawing = class {
  fills = /* @__PURE__ */ new Map();
  strokes = /* @__PURE__ */ new Map();
  minX = 0;
  maxX = 0;
  minY = 0;
  seen(x, y) {
    this.minX = Math.min(this.minX, x);
    this.maxX = Math.max(this.maxX, x);
    this.minY = Math.min(this.minY, y);
  }
  fill(cls, d) {
    const list = this.fills.get(cls) ?? [];
    list.push(d);
    this.fills.set(cls, list);
  }
  // A curved line from x0,y0 to x1,y1, pulled toward cx,cy.
  line(cls, x0, y0, cx, cy, x1, y1) {
    const list = this.strokes.get(cls) ?? [];
    list.push(`M${nums(x0, y0)}Q${nums(cx, cy, x1, y1)}`);
    this.strokes.set(cls, list);
    this.seen(x0, y0);
    this.seen(x1, y1);
  }
  path(cls, d) {
    const list = this.strokes.get(cls) ?? [];
    list.push(d);
    this.strokes.set(cls, list);
  }
  // An oval leaf from its base, pointing along `angle` (0 is up, positive
  // leans right). The far edge is a little fuller than the near one, so no
  // two leaves are mirror images.
  leaf(cls, x, y, angle, length, width, bend = 0) {
    const ux = Math.sin(angle);
    const uy = -Math.cos(angle);
    const nx = -uy;
    const ny = ux;
    const at = (along2, across) => [
      x + ux * length * along2 + nx * width * across,
      y + uy * length * along2 + ny * width * across
    ];
    const tip = at(1, bend);
    this.fill(
      cls,
      `M${nums(x, y)}C${nums(...at(0.12, 1), ...at(0.62, 0.95), ...tip)}C${nums(...at(0.7, -0.72), ...at(0.2, -1.02), x, y)}`
    );
    this.seen(...tip);
    this.seen(...at(0.4, 0.8));
    this.seen(...at(0.4, -0.8));
  }
  // A tapered blade from a base `width` wide to a point, curving through cx,cy.
  blade(cls, x, y, cx, cy, tx, ty, width) {
    const dx = cx - x;
    const dy = cy - y;
    const n = Math.hypot(dx, dy) || 1;
    const px = -dy / n * width;
    const py = dx / n * width;
    this.fill(
      cls,
      `M${nums(x - px, y - py)}Q${nums(cx - px, cy - py, tx, ty)}Q${nums(cx + px, cy + py, x + px, y + py)}`
    );
    this.seen(tx, ty);
    this.seen(cx, cy);
  }
  dot(cls, x, y, r) {
    this.fill(
      cls,
      `M${nums(x - r, y)}a${nums(r, r)} 0 1 0${nums(r * 2, 0)}a${nums(r, r)} 0 1 0${nums(-r * 2, 0)}`
    );
    this.seen(x - r, y - r);
    this.seen(x + r, y);
  }
  // A daisy seen a little from the side: petals around a centre, flattened.
  daisy(petal, x, y, radius, count, turn) {
    const tilt = 0.74;
    for (let i = 0; i < count; i++) {
      const a = turn + i / count * Math.PI * 2;
      const sx = Math.sin(a);
      const cy = Math.cos(a) * tilt;
      this.leaf(petal, x, y, Math.atan2(sx, cy), radius * Math.hypot(sx, cy), radius * 0.3);
    }
    this.dot("y", x, y, radius * 0.3);
  }
  markup() {
    let out = "";
    for (const cls of STROKE_ORDER) {
      const d = this.strokes.get(cls);
      if (d) out += `<path class="pl-${cls}" d="${d.join("")}"/>`;
    }
    for (const cls of FILL_ORDER) {
      const d = this.fills.get(cls);
      if (d) out += `<path class="pl-${cls}" d="${d.join("")}"/>`;
    }
    return out;
  }
};
function along(p0, p1, p2, u) {
  const v = 1 - u;
  const x = v * v * p0[0] + 2 * v * u * p1[0] + u * u * p2[0];
  const y = v * v * p0[1] + 2 * v * u * p1[1] + u * u * p2[1];
  const dx = 2 * v * (p1[0] - p0[0]) + 2 * u * (p2[0] - p1[0]);
  const dy = 2 * v * (p1[1] - p0[1]) + 2 * u * (p2[1] - p1[1]);
  return { x, y, heading: Math.atan2(dx, -dy) };
}
function drawPlant({ seed, words, linksOut, linksIn, species }) {
  const rand = random(`${species}:${seed}`);
  const rr = (lo, hi) => lo + rand() * (hi - lo);
  const pick = (items) => items[Math.floor(rand() * items.length)];
  const out = Math.min(linksOut, MAX_OUT);
  const inn = Math.min(linksIn, MAX_IN);
  const size = Math.max(0, Math.min(7.7, Math.log2(Math.max(words, 1) / 40)));
  const d = new Drawing();
  let flowers = 0;
  if (species === "grass") {
    const height = 34 + 20 * size;
    const count = Math.round(6 + size * 2.2 + out * 2);
    const spread = 0.5 + size * 0.03;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const side = t - 0.5;
      const angle = side * 2 * spread + rr(-0.14, 0.14);
      const length = height * (1 - Math.abs(side) * 0.9) * rr(0.62, 1.04);
      const x = side * (5 + size * 1.5) + rr(-1, 1);
      const droop = rr(0.1, 0.6) * Math.sign(angle || 1);
      d.blade(
        pick(["d", "c", "c", "b", "b", "a"]),
        x,
        0,
        x + Math.sin(angle) * length * 0.22,
        -Math.cos(angle) * length * 0.82,
        x + Math.sin(angle) * length + droop * length * 0.3,
        -Math.cos(angle) * length * (1 - Math.abs(droop) * 0.28),
        rr(1.4, 2.4) + size * 0.12
      );
    }
    for (let i = 0; i < inn; i++) {
      const angle = rr(-0.22, 0.22);
      const top = height * rr(1.02, 1.2);
      const x = rr(-3, 3);
      const tx = x + Math.sin(angle) * top;
      const ty = -Math.cos(angle) * top;
      d.line("t", x, 0, x + Math.sin(angle) * top * 0.3, ty * 0.6, tx, ty);
      d.leaf("k", tx, ty + 2, angle * 1.5, rr(10, 14), 2.6);
      flowers++;
    }
  } else if (species === "fern") {
    const height = 30 + 19 * size;
    const count = Math.round(3 + size * 0.9 + out);
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const side = t - 0.5;
      const angle = side * 2.1 + rr(-0.16, 0.16);
      const length = height * (1 - Math.abs(side) * 0.5) * rr(0.7, 1.05);
      const x = side * 4;
      const p0 = [x, 0];
      const p1 = [x + Math.sin(angle) * length * 0.3, -length * 0.78 * Math.cos(angle * 0.5)];
      const p2 = [x + Math.sin(angle) * length * 1.02, -Math.cos(angle) * length * 0.62];
      const tone = Math.abs(side) < 0.2 ? pick(["a", "b"]) : pick(["b", "c", "c", "d"]);
      d.line("s", p0[0], p0[1], p1[0], p1[1], p2[0], p2[1]);
      const step = (5 + length * 0.012) / length;
      const reach = Math.min(15, 4 + length * 0.17);
      for (let u = 0.16; u < 0.99; u += step) {
        const at = along(p0, p1, p2, u);
        const profile = u < 0.3 ? 0.5 + 0.5 * (u - 0.16) / 0.14 : Math.pow((1 - u) / 0.7, 0.8);
        const len = Math.max(1.6, reach * profile);
        d.leaf(tone, at.x, at.y, at.heading - 1.12, len, len * 0.36);
        d.leaf(tone, at.x, at.y, at.heading + 1.12, len, len * 0.36);
      }
    }
    for (let i = 0; i < inn; i++) {
      const x = rr(-4, 4);
      const top = height * rr(0.28, 0.42);
      const dir = i % 2 ? 1 : -1;
      d.path(
        "s",
        `M${nums(x, 0)}q${nums(dir * 2, -top * 0.6, dir * 1, -top)}a${nums(4, 4)} 0 1 ${dir > 0 ? 1 : 0}${nums(dir * 6.5, 1.5)}a${nums(2.4, 2.4)} 0 1 ${dir > 0 ? 1 : 0}${nums(dir * -3.6, 1.2)}`
      );
      flowers++;
    }
  } else if (species === "herb" || species === "willow" || species === "round") {
    const narrow = species === "willow";
    const paired = species === "round";
    const aspect = narrow ? 0.17 : paired ? 0.5 : 0.36;
    const reach = narrow ? 1.7 : paired ? 0.8 : 1;
    const height = 26 + 19 * size;
    const woody = size > 5.2;
    const lean = rr(-0.3, 0.3);
    const p0 = [0, 0];
    const p1 = [-lean * height * 0.35, -height * 0.55];
    const p2 = [lean * height * 0.4, -height];
    d.line(woody ? "w" : "s", 0, 0, p1[0], p1[1], p2[0], p2[1]);
    const leafLength = (8.5 + size * 1.5) * reach;
    const tips = [];
    const dress = (a, b, c, from, length) => {
      const step = (8 + size * 0.7) / length;
      let flip = rand() < 0.5 ? 1 : -1;
      for (let u = from; u < 0.96; u += step) {
        const at = along(a, b, c, u);
        const len = leafLength * (1.05 - 0.5 * u) * rr(0.85, 1.1);
        const tone = pick(u > 0.7 ? ["a", "b", "b"] : ["b", "c", "c", "d"]);
        if (paired) {
          d.leaf(tone, at.x, at.y, at.heading - 1.05, len, len * aspect);
          d.leaf(tone, at.x, at.y, at.heading + 1.05, len, len * aspect);
        } else {
          d.leaf(tone, at.x, at.y, at.heading + flip * rr(0.75, 1.1), len, len * aspect, flip * 0.1);
          flip = -flip;
        }
      }
      const end = along(a, b, c, 1);
      d.leaf("a", end.x, end.y, end.heading, leafLength * 0.62, leafLength * 0.62 * aspect);
      tips.push(end);
    };
    dress(p0, p1, p2, Math.max(0.16, 0.34 - size * 0.02), height);
    const branches = Math.min(9, out + Math.floor(Math.max(0, size - 3.2) * 1.5));
    let side = rand() < 0.5 ? 1 : -1;
    for (let i = 0; i < branches; i++) {
      const u = 0.22 + 0.5 * (i + rr(0.2, 0.8)) / branches;
      const at = along(p0, p1, p2, u);
      const length = height * (0.52 - u * 0.36) * rr(0.8, 1.15);
      const angle = at.heading + side * rr(0.55, 0.95);
      const b1 = [at.x + Math.sin(angle) * length * 0.55, at.y - Math.cos(angle) * length * 0.45];
      const b2 = [
        at.x + Math.sin(angle) * length * 0.8,
        at.y - Math.cos(angle) * length * 0.6 - length * 0.4
      ];
      d.line(woody && length > 40 ? "w" : "s", at.x, at.y, b1[0], b1[1], b2[0], b2[1]);
      dress([at.x, at.y], b1, b2, 0.3, length);
      side = -side;
    }
    for (let i = 0; i < inn; i++) {
      const tip = tips[i % tips.length];
      const again = Math.floor(i / tips.length);
      const x = tip.x + again * rr(-7, 7);
      const y = tip.y - 2 - again * rr(3, 6);
      d.daisy("p1", x, y, 4.4 + size * 0.35, 5, rr(0, 1));
      flowers++;
    }
  } else if (species === "rosette") {
    const height = 20 + 12.5 * size;
    const count = Math.round(7 + size * 1.4 + out * 2);
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const side = t - 0.5;
      const angle = side * 2.5 + rr(-0.1, 0.1);
      const length = height * (1 - Math.abs(side) * 0.75 * rr(0.6, 1)) * rr(0.8, 1);
      const x = side * 3;
      d.blade(
        Math.abs(side) > 0.3 ? pick(["d", "c", "c"]) : pick(["c", "b", "b", "a"]),
        x,
        0,
        x + Math.sin(angle * 0.55) * length * 0.55,
        -Math.cos(angle * 0.55) * length * 0.6,
        x + Math.sin(angle) * length,
        -Math.cos(angle) * length,
        2.6 + length * 0.055
      );
    }
    for (let i = 0; i < inn; i++) {
      const lean = rr(-0.16, 0.16) + (i - (inn - 1) / 2) * 0.2;
      const top = height * rr(1.5, 1.8);
      const p0 = [0, 0];
      const p1 = [lean * top * 0.2, -top * 0.6];
      const p2 = [lean * top, -top];
      d.line("s", 0, 0, p1[0], p1[1], p2[0], p2[1]);
      for (let u = 0.62, flip = 1; u <= 1; u += 0.055, flip = -flip) {
        const at = along(p0, p1, p2, u);
        d.leaf("y", at.x, at.y, at.heading + flip * 2.2, 5.5 - (u - 0.62) * 6, 1.5);
      }
      flowers++;
    }
  } else if (species === "flower") {
    const height = 30 + 18 * size;
    const petal = pick(["p1", "p1", "p2", "p3"]);
    const stems = 1 + Math.min(inn, 4);
    const basal = Math.round(4 + size * 0.8 + out * 2);
    for (let i = 0; i < basal; i++) {
      const t = basal === 1 ? 0.5 : i / (basal - 1);
      const angle = (t - 0.5) * 2.3 + rr(-0.12, 0.12);
      const length = Math.min(46, height * rr(0.22, 0.4)) * (1 - Math.abs(t - 0.5) * 0.4);
      d.leaf(pick(["c", "c", "b", "b"]), rr(-2, 2), 0, angle, length, length * 0.11, rr(-0.3, 0.3));
    }
    for (let i = 0; i < stems; i++) {
      const lean = i === 0 ? rr(-0.12, 0.12) : (i % 2 ? 1 : -1) * rr(0.18, 0.4);
      const top = height * (i === 0 ? 1 : rr(0.62, 0.86));
      const p0 = [0, 0];
      const p1 = [-lean * top * 0.3, -top * 0.55];
      const p2 = [lean * top, -top];
      d.line("s", 0, 0, p1[0], p1[1], p2[0], p2[1]);
      for (let u = rr(0.28, 0.36), flip = i % 2 ? 1 : -1; u < 0.72; u += rr(0.16, 0.24)) {
        const at = along(p0, p1, p2, u);
        const len = (9 + size * 1.6) * (1.1 - u);
        d.leaf(pick(["c", "b", "b"]), at.x, at.y, at.heading + flip * rr(0.6, 0.9), len, len * 0.2);
        flip = -flip;
      }
      const radius = (6.5 + size * 0.75) * (i === 0 ? 1 : 0.8);
      d.daisy(petal, p2[0], p2[1], radius, Math.round(rr(8, 11)), rr(0, 1));
      flowers++;
    }
  } else {
    const height = 32 + 18 * size;
    const straps = Math.round(3 + size * 0.45 + out * 2);
    for (let i = 0; i < straps; i++) {
      const t = straps === 1 ? 0.5 : i / (straps - 1);
      const angle = (t - 0.5) * 2 + rr(-0.2, 0.2);
      const length = height * rr(0.36, 0.6);
      const x = (t - 0.5) * 4;
      d.blade(
        pick(["d", "c", "c", "b"]),
        x,
        0,
        x + Math.sin(angle) * length * 0.35,
        -length * 0.95,
        x + Math.sin(angle) * length * 1.15,
        -Math.cos(angle) * length * 0.5,
        rr(2, 3.2)
      );
    }
    const stalks = 1 + Math.min(inn, 3);
    for (let i = 0; i < stalks; i++) {
      const lean = i === 0 ? rr(-0.1, 0.1) : (i % 2 ? 1 : -1) * rr(0.15, 0.3);
      const top = height * (i === 0 ? 1 : rr(0.6, 0.82));
      const x = lean * top;
      d.line("s", 0, 0, -lean * top * 0.25, -top * 0.5, x, -top);
      const radius = (5 + size * 1.5) * (i === 0 ? 1 : 0.72);
      d.dot("h", x, -top, radius * 0.95);
      const florets = Math.round(8 + radius * 1.9);
      for (let j = 0; j < florets; j++) {
        const r = radius * Math.sqrt((j + 0.6) / florets) * rr(0.92, 1.06);
        const a = j * 2.39996;
        d.dot("p2", x + Math.cos(a) * r, -top + Math.sin(a) * r, rr(0.9, 1.5) + radius * 0.03);
      }
      flowers++;
    }
  }
  return {
    body: d.markup(),
    halfWidth: Math.ceil(Math.max(-d.minX, d.maxX, 12)) + 3,
    height: Math.ceil(-d.minY) + 4,
    flowers
  };
}
function speciesOf(slug) {
  if (slug.startsWith("posts/")) return "flower";
  if (slug.startsWith("notes/microsoft/windows/")) return "grass";
  if (slug.startsWith("notes/microsoft/intune/")) return "round";
  if (slug.startsWith("notes/microsoft/azure/")) return "willow";
  if (slug.startsWith("notes/cloud/")) return "fern";
  if (slug.startsWith("notes/hardware/")) return "rosette";
  if (slug.startsWith("notes/projects/")) return "allium";
  return "herb";
}
function plantSvg(plant, id) {
  const { halfWidth: hw, height: h } = plant;
  const box = `viewBox="${-hw} ${-h} ${hw * 2} ${h + FOOT}"`;
  return `<svg class="plant-shadow" ${box} aria-hidden="true"><use href="#${id}"/></svg><svg class="plant-body" ${box} aria-hidden="true"><ellipse class="pl-e" cx="0" cy="1" rx="${Math.round(Math.min(hw * 0.5, 9 + h * 0.06))}" ry="3"/><g id="${id}">${plant.body}</g></svg>`;
}

// src/components/stats.ts
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

// src/components/styles/notePlant.scss
var notePlant_default = ".plant-box{position:relative;display:block;width:calc(var(--w)*var(--s, 1)*var(--u, 1px));height:calc(var(--h)*var(--s, 1)*var(--u, 1px))}.plant-box>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.pl-a{fill:var(--g1)}.pl-b{fill:var(--g2)}.pl-c{fill:var(--g3)}.pl-d{fill:var(--g4)}.pl-k{fill:var(--straw)}.pl-p1{fill:var(--p1);stroke:var(--petal-edge, none);stroke-width:.6}.pl-p2{fill:var(--p2)}.pl-p3{fill:var(--p3)}.pl-y{fill:var(--yolk)}.pl-h{fill:var(--p2);opacity:var(--globe, 0.3)}.pl-e{fill:var(--sh)}.pl-s,.pl-w,.pl-t{fill:none;stroke-linecap:round}.pl-s{stroke:var(--stem);stroke-width:calc(1.5*var(--stalk, 1))}.pl-w{stroke:var(--wood);stroke-width:calc(2.6*var(--stalk, 1))}.pl-t{stroke:var(--stem);stroke-width:calc(.8*var(--stalk, 1))}.plant-shadow{transform-origin:50% calc(100% - 8*var(--s, 1)*var(--u, 1px));transform:matrix(var(--sha), var(--shb), var(--shx), var(--shy), 0, 0);filter:blur(calc(1.4 * var(--s, 1) * var(--u, 1px)));pointer-events:none;--g1: var(--sh);--g2: var(--sh);--g3: var(--sh);--g4: var(--sh);--stem: var(--sh);--wood: var(--sh);--straw: var(--sh);--p1: var(--sh);--p2: var(--sh);--p3: var(--sh);--yolk: var(--sh);--globe: 0;--petal-edge: none;--stalk: 1.8}.note-plant{display:flex;flex-direction:column;align-items:center;margin:5rem 0 0;--s: 0.8;--petal-edge: color-mix(in srgb, var(--gray) 55%, transparent)}.note-plant figcaption{margin-top:.9rem;text-align:center;font-size:.857rem;line-height:1.5;color:var(--darkgray)}.note-plant figcaption p{margin:0;line-height:1.5}.note-plant-faint{color:var(--gray)}";

// src/components/NotePlant.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var defaultOptions = {
  roots: []
};
var plural = (n, one, many) => `${n.toLocaleString("en")} ${n === 1 ? one : many}`;
var day = (date, locale) => date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
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
    const { words, linksOut, linksIn } = noteStats(fileData, allFiles);
    const plant = drawPlant({ seed: slug, words, linksOut, linksIn, species: speciesOf(slug) });
    const locale = cfg.locale || "en-US";
    const dates = fileData.dates;
    const tended = dates?.modified;
    const written = Boolean(fileData.frontmatter?.created);
    const planted = written && dates?.created && tended && day(dates.created, locale) !== day(tended, locale) ? dates.created : void 0;
    const description = `This note's plant. Its size comes from the note's length (${plural(words, "word", "words")}), its leaves from the ${plural(linksOut, "note", "notes")} it links to, and its flowers from the ${plural(linksIn, "note", "notes")} that link here.`;
    return /* @__PURE__ */ jsxs("figure", { class: `note-plant ${displayClass ?? ""}`, children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          class: "plant-box",
          role: "img",
          "aria-label": description,
          title: description,
          style: `--w:${plant.halfWidth * 2};--h:${plant.height + FOOT}`,
          dangerouslySetInnerHTML: { __html: plantSvg(plant, "note-plant") }
        }
      ),
      /* @__PURE__ */ jsxs("figcaption", { children: [
        planted && /* @__PURE__ */ jsxs("p", { children: [
          "Planted ",
          /* @__PURE__ */ jsx("time", { datetime: planted.toISOString(), children: day(planted, locale) })
        ] }),
        tended && /* @__PURE__ */ jsxs("p", { class: planted ? "note-plant-faint" : void 0, children: [
          "Tended ",
          /* @__PURE__ */ jsx("time", { datetime: tended.toISOString(), children: day(tended, locale) })
        ] }),
        /* @__PURE__ */ jsxs("p", { class: "note-plant-faint note-plant-stats", children: [
          plural(words, "word", "words"),
          ", ",
          plural(linksOut, "link", "links"),
          " out,",
          " ",
          linksIn.toLocaleString("en"),
          " in"
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
