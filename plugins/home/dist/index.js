// src/components/Home.tsx
import { getDate, resolveRelative } from "@quartz-community/utils";

// ../note-plant/src/components/plant.ts
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

// src/components/scene.ts
var BEDS = [
  {
    folders: ["posts/"],
    href: "posts/",
    label: "Posts",
    wide: [40, 0.9, 14, 0.075],
    tall: [36, 0.9, 26, 0.065],
    keep: 5
  },
  {
    folders: ["notes/microsoft/windows/"],
    href: "notes/microsoft/windows/",
    label: "Windows",
    wide: [24, 0.43, 14, 0.12],
    tall: [30, 0.42, 23, 0.085],
    keep: 5
  },
  {
    folders: ["notes/microsoft/intune/"],
    href: "notes/microsoft/intune/",
    label: "Intune",
    wide: [8, 0.76, 5.5, 0.07],
    tall: [14, 0.66, 9, 0.05],
    keep: 2
  },
  {
    folders: [
      "notes/microsoft/defender/",
      "notes/microsoft/entra/",
      "notes/microsoft/exchange/",
      "notes/microsoft/"
    ],
    href: "notes/microsoft/",
    label: "Microsoft",
    wide: [47, 0.1, 15, 0.07],
    tall: [56, 0.12, 30, 0.06],
    keep: 4
  },
  {
    folders: ["notes/microsoft/azure/"],
    href: "notes/microsoft/azure/",
    label: "Azure",
    wide: [62, 0.31, 5, 0.05],
    tall: [84, 0.3, 9, 0.04],
    keep: 2
  },
  {
    folders: ["notes/cloud/"],
    href: "notes/cloud/",
    label: "Cloud",
    wide: [82, 0.27, 9, 0.09],
    tall: [74, 0.52, 15, 0.06],
    keep: 3
  },
  {
    folders: ["notes/projects/"],
    href: "notes/projects/",
    label: "Projects",
    wide: [66, 0.63, 6, 0.06],
    tall: [50, 0.7, 11, 0.045],
    keep: 2
  },
  {
    folders: ["notes/hardware/"],
    href: "notes/hardware/",
    label: "Hardware",
    wide: [88, 0.8, 7, 0.08],
    tall: [82, 0.84, 12, 0.055],
    keep: 2
  },
  {
    folders: ["notes/"],
    href: "notes/",
    label: "Notes",
    wide: [10, 0.16, 5, 0.05],
    tall: [16, 0.2, 10, 0.04],
    keep: 1
  }
];
function bedOf(slug) {
  let best;
  let length = 0;
  for (const bed of BEDS) {
    for (const folder of bed.folders) {
      if (slug.startsWith(folder) && folder.length > length) {
        best = bed;
        length = folder.length;
      }
    }
  }
  return best;
}
var WIDE = { top: 30, span: 59, far: 0.5, near: 1.45 };
var TALL = { top: 31, span: 55, far: 0.45, near: 1.15 };
var project = (frame, x, z) => ({
  x,
  y: frame.top + frame.span * Math.pow(z, 0.85),
  z,
  s: frame.far + (frame.near - frame.far) * z
});
function scatter(ellipse, count, phase, tall = false) {
  const [cx, cz, rx, rz] = ellipse;
  const frame = tall ? TALL : WIDE;
  const spots = [];
  for (let k = 0; k < count; k++) {
    const r = count === 1 ? 0 : Math.sqrt((k + 0.5) / count);
    const a = k * 2.39996 + phase;
    const z = Math.max(0.02, Math.min(1, cz + rz * r * Math.sin(a)));
    spots.push(project(frame, cx + rx * r * Math.cos(a), z));
  }
  return spots;
}
function labelSpot(ellipse, tall = false) {
  const [cx, cz, , rz] = ellipse;
  return project(tall ? TALL : WIDE, cx, Math.min(1, cz + rz + 0.035));
}

// src/components/styles/home.scss
var home_default = `.scene{position:relative;isolation:isolate;height:100vh;height:100svh;min-height:30rem;overflow:hidden;background:var(--l-sky2);--u: min(calc(100vw / 1440), calc(100svh / 900))}.scene-sky,.scene-ground,.scene-plants,.scene-fireflies,.scene-grain,.scene-foot{position:absolute;inset:0}.scene-sky{background:radial-gradient(ellipse 50% 46% at var(--l-sun-x) var(--l-sun-y), var(--l-sun), transparent 72%),linear-gradient(var(--l-sky1), var(--l-sky2) 30%)}.scene-stars{position:absolute;inset:0 0 auto;width:100%;height:21%;fill:#fff;opacity:var(--l-stars)}.scene-far{position:absolute;top:21.5%;left:0;width:100%;height:7%;fill:var(--l-far);opacity:.55;filter:blur(1.5px);mask-image:linear-gradient(#000 45%, transparent 95%);-webkit-mask-image:linear-gradient(#000 45%, transparent 95%)}.scene-ground{top:26%;background:radial-gradient(ellipse 36% 30% at var(--l-pool-x) 44%, var(--l-pool), transparent 72%),radial-gradient(ellipse 20% 13% at calc(var(--l-pool-x) + 27%) 17%, var(--l-pool), transparent 72%),radial-gradient(ellipse 24% 17% at calc(var(--l-pool-x) - 31%) 74%, var(--l-pool), transparent 72%),linear-gradient(var(--l-ground1), var(--l-ground2) 55%);mask-image:linear-gradient(transparent, #000 8%);-webkit-mask-image:linear-gradient(transparent, #000 8%)}.plant,.bed-label{--x: var(--x1);--y: var(--y1);--s: var(--s1);--d: var(--d1);position:absolute;left:calc(var(--x)*1%);top:calc(var(--y)*1%);z-index:calc(var(--y)*10)}.plant{width:0;height:0}.plant:hover,.plant:focus-visible{z-index:2000;outline:none}.plant>.plant-art{position:absolute;left:calc(var(--w)*var(--s)*var(--u)/-2);bottom:calc(-8*var(--s)*var(--u));opacity:calc(.5 + .5*min(1,var(--d)*1.6))}.plant:hover>.plant-art,.plant:focus-visible>.plant-art{opacity:1}.plant:focus-visible>.plant-art{outline:1px solid var(--l-hud);outline-offset:3px}.plant-tag{position:absolute;left:0;bottom:calc((var(--h) - 6)*var(--s)*var(--u));transform:translateX(-50%);display:flex;flex-direction:column;padding:.3rem .6rem .35rem;border:1px solid var(--lightgray);background:var(--light);font-size:.75rem;line-height:1.4;white-space:nowrap;color:var(--gray);opacity:0;pointer-events:none;transition:opacity .15s ease}.plant-tag b{font-weight:500;color:var(--dark)}.plant:hover>.plant-tag,.plant:focus-visible>.plant-tag{opacity:1}.plant-left>.plant-tag{transform:translateX(-1.5rem)}.plant-right>.plant-tag{transform:translateX(calc(-100% + 1.5rem))}.bed-label{transform:translate(-50%, 0.2rem);padding:.1rem .3rem;font-size:.72rem;line-height:1.2;white-space:nowrap;color:var(--l-hud);text-shadow:0 0 .5rem var(--l-halo);text-decoration:none;opacity:0;transition:opacity .25s ease}.scene-plants:hover>.bed-label,.scene-plants:focus-within>.bed-label{opacity:.8}@media(hover: none){.bed-label{opacity:.6}}.scene-plants>.bed-label:hover,.scene-plants>.bed-label:focus-visible{z-index:2000;opacity:1;text-decoration:underline;text-underline-offset:.25em}.scene-skip{position:absolute;top:-4rem;left:2rem;z-index:3000;padding:.3rem .6rem;border:1px solid var(--lightgray);background:var(--light);color:var(--dark)}.scene-skip:focus{top:4.5rem}@media(prefers-reduced-motion: no-preference){.plant .plant-body{transform-origin:50% calc(100% - 8*var(--s)*var(--u))}.plant:nth-of-type(5n + 2) .plant-body{animation:scene-sway 9s ease-in-out infinite alternate}.plant:nth-of-type(10n + 7) .plant-body{animation-duration:13s;animation-delay:-5s}.plant:hover .plant-body{animation:scene-sway 1.6s ease-in-out infinite alternate}}@keyframes scene-sway{from{transform:skewX(-1.3deg)}to{transform:skewX(1.6deg)}}.scene-fireflies{z-index:1200;opacity:var(--l-stars);pointer-events:none}.scene-fireflies i{position:absolute;width:3px;height:3px;border-radius:50%;background:#f3eaa5;box-shadow:0 0 7px 2px rgba(243,234,165,.45)}.scene-fireflies i:nth-child(1){left:24%;top:55%}.scene-fireflies i:nth-child(2){left:38%;top:71%}.scene-fireflies i:nth-child(3){left:63%;top:62%}.scene-fireflies i:nth-child(4){left:79%;top:50%}.scene-fireflies i:nth-child(5){left:86%;top:70%}.scene-fireflies i:nth-child(6){left:12%;top:68%}@media(prefers-reduced-motion: no-preference){.scene-fireflies i{animation:scene-drift 19s ease-in-out infinite alternate,scene-glow 5s ease-in-out infinite alternate}.scene-fireflies i:nth-child(2n){animation-duration:27s,7s;animation-delay:-8s,-3s}.scene-fireflies i:nth-child(3n){animation-duration:23s,6s;animation-delay:-15s,-1s;animation-direction:alternate-reverse,alternate}}@keyframes scene-drift{from{transform:translate(0, 0)}50%{transform:translate(2.2rem, -1.4rem)}to{transform:translate(-1.2rem, -2.6rem)}}@keyframes scene-glow{from{opacity:.15}to{opacity:1}}.scene-grain{z-index:1300;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='.6 .6 .6 0 -.4 .6 .6 .6 0 -.4 .6 .6 .6 0 -.4 0 0 0 0 1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");mix-blend-mode:soft-light;opacity:.55;pointer-events:none}.scene-foot{z-index:1;background:linear-gradient(transparent 85%, var(--page) 99%),radial-gradient(ellipse 85% 75% at 50% 45%, transparent 60%, var(--l-shade));pointer-events:none}.scene-count,.scene-time{position:absolute;bottom:1.5rem;z-index:1500;margin:0;font-size:.8rem;line-height:1.5;color:var(--gray)}.scene-count{left:2rem}.scene-time{right:2rem;text-align:right}@media(scripting: none){.scene-time{display:none}}@media(max-width: 800px)and (orientation: portrait){.scene{--u: calc(min(100vw / 390, 100svh / 844) * 0.92)}.plant,.bed-label{--x: var(--x2);--y: var(--y2);--s: var(--s2);--d: var(--d2)}.plant-wide{display:none}.scene-count,.scene-time{left:1.15rem;right:1.15rem;font-size:.72rem;text-align:left;white-space:nowrap}.scene-count{bottom:1rem}.scene-time{bottom:2.2rem}}.home-index section{margin-top:3.5rem}.home-index h2{margin:0 0 .55rem;padding-bottom:.55rem;border-bottom:1px solid var(--lightgray);font-size:1em;font-weight:600;line-height:1.5}.home-index h2 a{color:var(--dark);text-decoration:none}.home-index h2 a:hover{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.25em}.home-index ol,.home-index ul{margin:0;padding:0;list-style:none}.home-index li a{color:var(--darkgray);text-decoration:none}.home-index li a:hover{color:var(--dark);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.25em}.home-index ol li{display:flex;align-items:baseline;justify-content:space-between;gap:1.5rem}.home-index time{flex:none;color:var(--gray)}.home-index ul li{display:inline}.home-index ul li:not(:last-child)::after{content:", ";color:var(--gray)}.home-row{display:grid;grid-template-columns:10.5rem minmax(0, 1fr);gap:0 1rem;padding:.3rem 0}.home-row h3{margin:0;font-size:1em;font-weight:400;line-height:inherit;color:var(--gray)}.home-row h3 a{color:inherit;text-decoration:none}.home-row h3 a:hover{color:var(--dark);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.25em}.home-row.home-year{grid-template-columns:4.5rem minmax(0, 1fr)}@media(max-width: 600px){.home-row:not(.home-year){grid-template-columns:minmax(0, 1fr);padding:.45rem 0}}.home-legend{margin:3.5rem 0 0;font-size:.857rem;color:var(--gray)}`;

// src/components/Home.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var defaultOptions = {
  section: "index",
  postsFolder: "posts",
  notesFolder: "notes"
};
var STARS = Array.from({ length: 70 }, (_, i) => {
  const a = Math.sin(i * 127.1 + 3.3) * 43758.5453;
  const b = Math.sin(i * 269.5 + 1.7) * 24634.6345;
  const c = Math.sin(i * 419.2 + 7.1) * 13758.1234;
  const [x, y, r] = [a - Math.floor(a), b - Math.floor(b), c - Math.floor(c)];
  return `<circle cx="${Math.round(x * 1e3)}" cy="${Math.round(y * y * 380)}" r="${(0.5 + r * r * 1.1).toFixed(1)}" opacity="${(0.35 + r * 0.65).toFixed(2)}"/>`;
}).join("");
var HEDGE = (() => {
  let d = "M0 60";
  for (let x = 0; x <= 1440; x += 30) {
    const y = 30 - Math.sin(x * 0.011 + 1) * 9 - Math.sin(x * 0.037 + 2) * 6 - Math.sin(x * 0.083) * 3;
    d += `L${x} ${Math.round(y)}`;
  }
  return `<path d="${d}V60z"/>`;
})();
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
    const day = (d) => d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
    const newestFirst = (prefix) => allFiles.filter((f) => f.slug?.startsWith(prefix) && !f.slug.endsWith("/index")).map((f) => ({ f, date: dateOf(f) })).filter((n) => Boolean(n.date)).sort((a, b) => b.date.getTime() - a.date.getTime());
    const notes = newestFirst(notesPrefix);
    const posts = newestFirst(postsPrefix);
    if (options.section === "scene") {
      const all = [...posts, ...notes];
      const lastTended = all.reduce((latest, n) => n.date > latest ? n.date : latest, /* @__PURE__ */ new Date(0));
      const beds = /* @__PURE__ */ new Map();
      for (const n of all) {
        const bed = bedOf(n.f.slug);
        if (bed) beds.set(bed, [...beds.get(bed) ?? [], n]);
      }
      let id = 0;
      const place = (wide, tall) => {
        const r = (v) => Math.round(v * 100) / 100;
        let out = `--x1:${r(wide.x)};--y1:${r(wide.y)};--s1:${r(wide.s)};--d1:${r(wide.z)}`;
        if (tall) out += `;--x2:${r(tall.x)};--y2:${r(tall.y)};--s2:${r(tall.s)};--d2:${r(tall.z)}`;
        return out;
      };
      const garden = BEDS.flatMap((bed, b) => {
        const grown = beds.get(bed) ?? [];
        if (grown.length === 0) return [];
        const wide = scatter(bed.wide, grown.length, b * 1.7 + 0.4);
        const kept = Math.min(bed.keep, grown.length);
        const tall = scatter(bed.tall, kept, b * 1.7 + 0.4, true);
        const plants = grown.map(({ f, date }, i) => {
          const slug = f.slug;
          const plant = drawPlant({
            seed: slug,
            ...noteStats(f, allFiles),
            species: speciesOf(slug)
          });
          const spot = wide[i];
          const edge = spot.x < 12 ? " plant-left" : spot.x > 88 ? " plant-right" : "";
          return {
            x: spot.x,
            el: /* @__PURE__ */ jsxs(
              "a",
              {
                class: `plant${i < kept ? "" : " plant-wide"}${edge}`,
                href: href(slug),
                "aria-label": `${title(f)}, tended ${day(date)}`,
                style: `--w:${plant.halfWidth * 2};--h:${plant.height + FOOT};${place(spot, tall[i])}`,
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      class: "plant-art plant-box",
                      dangerouslySetInnerHTML: { __html: plantSvg(plant, `p${id++}`) }
                    }
                  ),
                  /* @__PURE__ */ jsxs("span", { class: "plant-tag", "aria-hidden": "true", children: [
                    /* @__PURE__ */ jsx("b", { children: title(f) }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      "tended ",
                      day(date)
                    ] })
                  ] })
                ]
              }
            )
          };
        }).sort((p, q) => p.x - q.x).map((p) => p.el);
        return [
          ...plants,
          /* @__PURE__ */ jsx(
            "a",
            {
              class: "bed-label",
              href: href(`${bed.href}index`),
              style: place(labelSpot(bed.wide), labelSpot(bed.tall, true)),
              children: bed.label
            }
          )
        ];
      });
      return /* @__PURE__ */ jsxs("div", { class: `scene ${displayClass ?? ""}`, children: [
        /* @__PURE__ */ jsx("div", { class: "scene-sky" }),
        /* @__PURE__ */ jsx(
          "svg",
          {
            class: "scene-stars",
            viewBox: "0 0 1000 400",
            preserveAspectRatio: "xMidYMin slice",
            "aria-hidden": "true",
            dangerouslySetInnerHTML: { __html: STARS }
          }
        ),
        /* @__PURE__ */ jsx(
          "svg",
          {
            class: "scene-far",
            viewBox: "0 0 1440 60",
            preserveAspectRatio: "none",
            "aria-hidden": "true",
            dangerouslySetInnerHTML: { __html: HEDGE }
          }
        ),
        /* @__PURE__ */ jsx("div", { class: "scene-ground" }),
        /* @__PURE__ */ jsxs("nav", { class: "scene-plants", "aria-label": "The garden: a plant for each note and post", children: [
          /* @__PURE__ */ jsx("a", { class: "scene-skip", href: "#index", children: "Skip the garden" }),
          garden
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "scene-fireflies", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsx("i", {}),
          /* @__PURE__ */ jsx("i", {}),
          /* @__PURE__ */ jsx("i", {}),
          /* @__PURE__ */ jsx("i", {}),
          /* @__PURE__ */ jsx("i", {}),
          /* @__PURE__ */ jsx("i", {})
        ] }),
        /* @__PURE__ */ jsx("div", { class: "scene-grain" }),
        /* @__PURE__ */ jsx("div", { class: "scene-foot" }),
        /* @__PURE__ */ jsxs("p", { class: "scene-count", children: [
          notes.length,
          " notes \xB7 ",
          posts.length,
          " posts \xB7 last tended",
          " ",
          /* @__PURE__ */ jsx("time", { datetime: lastTended.toISOString(), children: day(lastTended) })
        ] }),
        /* @__PURE__ */ jsxs("p", { class: "scene-time", children: [
          /* @__PURE__ */ jsx("span", { "data-light-name": true, children: "midday" }),
          " ",
          /* @__PURE__ */ jsx("span", { "data-light-clock": true })
        ] })
      ] });
    }
    const years = /* @__PURE__ */ new Map();
    for (const post of posts) {
      const year = post.date.getFullYear();
      years.set(year, [...years.get(year) ?? [], post]);
    }
    const depth = notesPrefix.split("/").length - 1;
    const folders = /* @__PURE__ */ new Map();
    for (const note of notes) {
      const folder = note.f.slug.split("/").slice(0, -1).join("/");
      const names = (note.f.relativePath ?? "").split("/").slice(depth, -1);
      const group = folders.get(folder) ?? { names, notes: [] };
      group.notes.push(note);
      folders.set(folder, group);
    }
    const root = notesPrefix.slice(0, -1);
    const sorted = [...folders.entries()].sort(([a], [b]) => {
      if (a === root) return 1;
      if (b === root) return -1;
      return a.localeCompare(b);
    });
    return /* @__PURE__ */ jsxs("div", { class: `home-index ${displayClass ?? ""}`, id: "index", children: [
      posts.length > 0 && /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("a", { href: href(`${postsPrefix}index`), children: "Posts" }) }),
        [...years.entries()].map(([year, items]) => /* @__PURE__ */ jsxs("div", { class: "home-row home-year", children: [
          /* @__PURE__ */ jsx("h3", { children: year }),
          /* @__PURE__ */ jsx("ol", { children: items.map(({ f, date }) => /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("a", { href: href(f.slug), children: title(f) }),
            /* @__PURE__ */ jsx("time", { datetime: date.toISOString(), children: date.toLocaleDateString(locale, { day: "numeric", month: "short" }) })
          ] })) })
        ] }))
      ] }),
      notes.length > 0 && /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("a", { href: href(`${notesPrefix}index`), children: "Notes" }) }),
        sorted.map(([folder, group]) => /* @__PURE__ */ jsxs("div", { class: "home-row", children: [
          /* @__PURE__ */ jsx("h3", { children: folder === root ? "Loose" : /* @__PURE__ */ jsx("a", { href: href(`${folder}/index`), children: group.names.join(" / ") }) }),
          /* @__PURE__ */ jsx("ul", { children: group.notes.sort(
            (a, b) => title(a.f).localeCompare(title(b.f), locale, {
              numeric: true,
              sensitivity: "base"
            })
          ).map(({ f }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: href(f.slug), children: title(f) }) })) })
        ] }))
      ] }),
      /* @__PURE__ */ jsx("p", { class: "home-legend", children: "Each plant in the garden is one of these. It grows taller as the note gets longer, puts out leaves for the notes it links to, and flowers when another note links back. Posts always flower. The light is your local time." })
    ] });
  };
  Home.css = home_default;
  return Home;
});
export {
  Home_default as Home
};
