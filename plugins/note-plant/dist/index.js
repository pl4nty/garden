// ../shared/listing.tsx
import { getDate } from "@quartz-community/utils";
import { jsx, jsxs } from "preact/jsx-runtime";
var isoDate = (d) => d.toISOString().slice(0, 10);
function dateOf(f, cfg) {
  const fallback = cfg.defaultDateType;
  const data = { ...f, defaultDateType: f.defaultDateType ?? fallback };
  return data.defaultDateType ? getDate(data) : void 0;
}

// src/components/ascii.ts
function random(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  let a = h >>> 0;
  return () => {
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function growPlant({ seed, words, linksOut, linksIn }) {
  const rand = random(seed);
  const height = Math.min(8, Math.max(1, 1 + Math.floor(Math.log2(Math.max(words, 60) / 60))));
  const left = Array(height).fill("");
  const right = Array(height).fill("");
  const order = [...Array(height).keys()];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const leaves = Math.min(linksOut, height * 2);
  const sides = rand() < 0.5 ? [left, right] : [right, left];
  for (let n = 0; n < leaves; n++) {
    const turn = n % height;
    const side = sides[(turn + (n < height ? 0 : 1)) % 2];
    side[order[turn]] = "leaf";
  }
  const free = height * 2 - leaves;
  const flowers = Math.min(linksIn, 1 + free);
  let twigs = flowers - 1;
  for (let line = height - 1; line >= 0 && twigs > 0; line--) {
    for (const side of rand() < 0.5 ? [left, right] : [right, left]) {
      if (twigs > 0 && side[line] === "") {
        side[line] = "flower";
        twigs--;
      }
    }
  }
  const lines = [`  ${flowers > 0 ? "*" : "'"}  `];
  for (let line = height - 1; line >= 0; line--) {
    const l = left[line] === "leaf" ? " \\" : left[line] === "flower" ? "o-" : "  ";
    const r = right[line] === "leaf" ? "/ " : right[line] === "flower" ? "-o" : "  ";
    lines.push(`${l}|${r}`);
  }
  lines.push("__|__");
  return { lines, leaves, flowers };
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
var notePlant_default = ".note-plant{display:flex;flex-wrap:wrap;align-items:flex-end;gap:0 2ch;margin:0}.note-plant pre{flex:none;margin:0;padding:0;border:0;overflow:visible}.note-plant figcaption{flex:1 1 30ch}";

// src/components/NotePlant.tsx
import { Fragment, jsx as jsx2, jsxs as jsxs2 } from "preact/jsx-runtime";
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
    const { words, linksOut, linksIn } = noteStats(fileData, allFiles);
    const plant = growPlant({ seed: slug, words, linksOut, linksIn });
    const date = dateOf(fileData, cfg);
    const description = `A plant drawn in text from this note. Its height comes from the note's length, it has ${plural(plant.leaves, "leaf", "leaves")} for the notes it links to and ${plural(plant.flowers, "flower", "flowers")} for the notes that link here.`;
    return /* @__PURE__ */ jsxs2("figure", { class: `note-plant ${displayClass ?? ""}`, children: [
      /* @__PURE__ */ jsx2("pre", { role: "img", "aria-label": description, children: plant.lines.join("\n") }),
      /* @__PURE__ */ jsxs2("figcaption", { children: [
        date && /* @__PURE__ */ jsxs2(Fragment, { children: [
          "tended ",
          /* @__PURE__ */ jsx2("time", { datetime: date.toISOString(), children: isoDate(date) }),
          " \xB7",
          " "
        ] }),
        plural(words, "word", "words"),
        " \xB7 ",
        plural(linksOut, "link", "links"),
        " out \xB7",
        " ",
        plural(linksIn, "link", "links"),
        " in"
      ] })
    ] });
  };
  NotePlant.css = notePlant_default;
  return NotePlant;
});
export {
  NotePlant_default as NotePlant
};
