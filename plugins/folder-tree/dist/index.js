// src/components/FolderTree.tsx
import { getDate, resolveRelative } from "@quartz-community/utils";

// ../shared/garden/plants.ts
var NOTE_SPECIES = ["bay", "fern", "reed", "gum"];
function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function speciesOf(slug) {
  const parts = slug.split("/");
  if (parts[0] === "posts") return "daisy";
  const folder = parts.slice(0, -1).join("/");
  return NOTE_SPECIES[(hash(folder) >>> 24) % NOTE_SPECIES.length];
}

// src/components/styles/folderTree.scss
var folderTree_default = ".folder-tree{margin-top:.5rem}.folder-tree-count{margin:0 0 1.75rem;color:var(--gray)}.folder-tree-groups{columns:3;column-gap:2.5rem}.folder-tree-groups.single{columns:1;max-width:24rem}@media(max-width: 1100px){.folder-tree-groups{columns:2}}@media(max-width: 600px){.folder-tree-groups{columns:1}}.folder-tree-group{break-inside:avoid;padding-bottom:1.5rem}.folder-tree-group h2{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;margin:0 0 .35rem;padding-bottom:.25rem;border-bottom:2px solid var(--ink1);font-size:1rem;font-weight:700;line-height:1.4;color:var(--dark)}.folder-tree-group h2 a{font-weight:inherit;color:inherit;background-color:rgba(0,0,0,0);text-decoration:none}.folder-tree-group h2 a:hover{text-decoration:underline;text-decoration-color:var(--ink2);text-decoration-thickness:2px;text-underline-offset:.18em}.folder-tree-group .folder-tree-n{font-family:var(--bodyFont);font-size:.85em;font-weight:400;color:var(--gray)}.folder-tree-group ul{margin:0;padding:0;list-style:none}.folder-tree-group li{margin:0}.folder-tree-group li a{display:flex;align-items:baseline;justify-content:space-between;gap:.8rem;padding:.12rem 0;font-weight:400;line-height:1.4;color:var(--darkgray);background-color:rgba(0,0,0,0);text-decoration:none}.folder-tree-group li a:hover span{color:var(--dark);text-decoration:underline;text-decoration-color:var(--ink2);text-decoration-thickness:2px;text-underline-offset:.18em}.folder-tree-group time{flex-shrink:0;font-size:.85em;color:var(--gray)}";

// src/components/FolderTree.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var defaultOptions = {
  roots: ["notes"]
};
var species = {
  bay: ["bay", "bays"],
  fern: ["fern", "ferns"],
  reed: ["reed", "reeds"],
  gum: ["gum", "gums"],
  daisy: ["daisy", "daisies"]
};
var FolderTree_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const roots = options.roots.map((r) => r.replace(/\/$/, "").toLowerCase());
  const FolderTree = ({
    fileData,
    allFiles,
    cfg,
    displayClass
  }) => {
    const slug = fileData.slug ?? "";
    if (!slug.endsWith("/index")) return null;
    const here = slug.slice(0, -"/index".length);
    if (!roots.some((r) => here === r || here.startsWith(`${r}/`))) return null;
    const locale = cfg.locale || "en-US";
    const cfgDateType = cfg.defaultDateType;
    const dateOf = (f) => {
      const data = {
        ...f,
        defaultDateType: f.defaultDateType ?? cfgDateType
      };
      return data.defaultDateType ? getDate(data) : void 0;
    };
    const depth = here.split("/").length;
    const groups = /* @__PURE__ */ new Map();
    for (const f of allFiles) {
      const s = f.slug;
      if (!s || !s.startsWith(`${here}/`) || s.endsWith("/index")) continue;
      const folder = s.split("/").slice(0, -1).join("/");
      const names = (f.relativePath ?? "").split("/").slice(depth, -1);
      const group = groups.get(folder) ?? { folder, names, notes: [] };
      group.notes.push({ f, date: dateOf(f) });
      groups.set(folder, group);
    }
    if (groups.size === 0) return null;
    const sorted = [...groups.values()].sort((a, b) => {
      if (a.folder === here) return 1;
      if (b.folder === here) return -1;
      return a.folder.localeCompare(b.folder);
    });
    const total = sorted.reduce((n, g) => n + g.notes.length, 0);
    const hasSubfolders = sorted.some((g) => g.folder !== here);
    return /* @__PURE__ */ jsxs("section", { class: `folder-tree ${displayClass ?? ""}`, children: [
      /* @__PURE__ */ jsxs("p", { class: "folder-tree-count", children: [
        total,
        " ",
        total === 1 ? "note" : "notes",
        hasSubfolders && ` in ${sorted.filter((g) => g.folder !== here).length} folders`
      ] }),
      /* @__PURE__ */ jsx("div", { class: `folder-tree-groups ${hasSubfolders ? "" : "single"}`, children: sorted.map((group) => /* @__PURE__ */ jsxs("div", { class: "folder-tree-group", children: [
        hasSubfolders && /* @__PURE__ */ jsxs("h2", { children: [
          group.folder === here ? "Everything else" : /* @__PURE__ */ jsx("a", { href: resolveRelative(slug, `${group.folder}/index`), children: group.names.join(" / ") }),
          /* @__PURE__ */ jsxs("span", { class: "folder-tree-n", children: [
            group.notes.length,
            " ",
            species[speciesOf(`${group.folder}/`)][group.notes.length === 1 ? 0 : 1]
          ] })
        ] }),
        /* @__PURE__ */ jsx("ul", { children: group.notes.sort(
          (a, b) => (a.f.frontmatter?.title ?? "").localeCompare(
            b.f.frontmatter?.title ?? "",
            locale,
            { numeric: true, sensitivity: "base" }
          )
        ).map(({ f, date }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: resolveRelative(slug, f.slug), children: [
          /* @__PURE__ */ jsx("span", { children: f.frontmatter?.title ?? f.slug ?? "" }),
          date && /* @__PURE__ */ jsx("time", { datetime: date.toISOString(), children: date.toLocaleDateString(locale, { month: "short", year: "numeric" }) })
        ] }) })) })
      ] })) })
    ] });
  };
  FolderTree.css = folderTree_default;
  return FolderTree;
});
export {
  FolderTree_default as FolderTree
};
