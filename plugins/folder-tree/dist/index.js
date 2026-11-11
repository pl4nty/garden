// src/components/FolderTree.tsx
import { getDate, resolveRelative } from "@quartz-community/utils";

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

// src/components/styles/folderTree.scss
var folderTree_default = ".folder-tree{margin-top:.5rem}.folder-tree-count{margin:0 0 1.75rem;color:var(--gray)}.folder-tree-groups{columns:3;column-gap:3rem}.folder-tree-groups.single{columns:1;max-width:24rem}@media(max-width: 1100px){.folder-tree-groups{columns:2}}@media(max-width: 600px){.folder-tree-groups{columns:1}}.folder-tree-group{break-inside:avoid;padding-bottom:1.5rem}.folder-tree-group h2{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;margin:0 0 .3rem;padding-bottom:.2rem;border-bottom:1px solid var(--lightgray);font-size:1rem;font-weight:400;font-variant-caps:all-small-caps;letter-spacing:.06em;line-height:1.4;color:var(--gray)}.folder-tree-group h2 a{color:inherit;background-color:rgba(0,0,0,0);text-decoration:none}.folder-tree-group h2 a:hover{color:var(--dark)}.folder-tree-group .folder-tree-n{font-size:.9em;letter-spacing:0}.folder-tree-group ul{margin:0;padding:0;list-style:none}.folder-tree-group li{margin:0}.folder-tree-group li a{display:flex;align-items:baseline;justify-content:space-between;gap:.8rem;padding:.12rem 0;line-height:1.4;color:var(--darkgray);background-color:rgba(0,0,0,0);text-decoration:none}.folder-tree-group li a:hover span{color:var(--dark);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.folder-tree-group time{flex-shrink:0;font-size:.9em;color:var(--gray)}";

// src/components/FolderTree.tsx
import { jsx as jsx2, jsxs } from "preact/jsx-runtime";
var defaultOptions = {
  roots: ["notes"]
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
      /* @__PURE__ */ jsx2("div", { class: `folder-tree-groups ${hasSubfolders ? "" : "single"}`, children: sorted.map((group) => /* @__PURE__ */ jsxs("div", { class: "folder-tree-group", children: [
        hasSubfolders && /* @__PURE__ */ jsxs("h2", { children: [
          group.folder === here ? "Everything else" : /* @__PURE__ */ jsx2("a", { href: resolveRelative(slug, `${group.folder}/index`), children: group.names.join(" / ") }),
          /* @__PURE__ */ jsx2("span", { class: "folder-tree-n", children: group.notes.length })
        ] }),
        /* @__PURE__ */ jsx2("ul", { children: group.notes.sort(
          (a, b) => (a.f.frontmatter?.title ?? "").localeCompare(
            b.f.frontmatter?.title ?? "",
            locale,
            { numeric: true, sensitivity: "base" }
          )
        ).map(({ f, date }) => /* @__PURE__ */ jsx2("li", { children: /* @__PURE__ */ jsxs("a", { href: resolveRelative(slug, f.slug), children: [
          /* @__PURE__ */ jsx2("span", { children: smallCaps(f.frontmatter?.title ?? f.slug ?? "") }),
          date && /* @__PURE__ */ jsx2("time", { datetime: date.toISOString(), children: date.toLocaleDateString(locale, { month: "short", year: "numeric" }) })
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
