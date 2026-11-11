// src/components/FolderTree.tsx
import { getDate, resolveRelative } from "@quartz-community/utils";

// src/components/styles/folderTree.scss
var folderTree_default = ".folder-tree{margin-top:.25rem}";

// src/components/FolderTree.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var defaultOptions = {
  roots: ["notes"],
  newestFirst: []
};
var isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
var FolderTree_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const clean = (r) => r.replace(/\/$/, "").toLowerCase();
  const roots = options.roots.map(clean);
  const newestFirst = options.newestFirst.map(clean);
  const FolderTree = ({
    fileData,
    allFiles,
    cfg,
    displayClass
  }) => {
    const slug = fileData.slug ?? "";
    if (!slug.endsWith("/index")) return null;
    const here = slug.slice(0, -"/index".length);
    const root = roots.find((r) => here === r || here.startsWith(`${r}/`));
    if (root === void 0) return null;
    const byDate = newestFirst.includes(root);
    const locale = cfg.locale || "en-US";
    const cfgDateType = cfg.defaultDateType;
    const dateOf = (f) => {
      const data = {
        ...f,
        defaultDateType: f.defaultDateType ?? cfgDateType
      };
      return data.defaultDateType ? getDate(data) : void 0;
    };
    const titleOf = (f) => f.frontmatter?.title ?? f.slug ?? "";
    const depth = here.split("/").length;
    const groups = /* @__PURE__ */ new Map();
    for (const f of allFiles) {
      const s = f.slug;
      if (!s || !s.startsWith(`${here}/`) || s.endsWith("/index")) continue;
      const folder = s.split("/").slice(0, -1).join("/");
      const names = (f.relativePath ?? "").split("/").slice(depth, -1);
      const group = groups.get(folder) ?? { folder, names, entries: [] };
      const words = (f.text ?? "").split(/\s+/).filter(Boolean).length;
      group.entries.push({ f, date: dateOf(f), words });
      groups.set(folder, group);
    }
    if (groups.size === 0) return null;
    const sorted = [...groups.values()].sort((a, b) => {
      if (a.folder === here) return 1;
      if (b.folder === here) return -1;
      return a.folder.localeCompare(b.folder);
    });
    for (const group of sorted) {
      group.entries.sort(
        (a, b) => byDate ? (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0) : titleOf(a.f).localeCompare(titleOf(b.f), locale, {
          numeric: true,
          sensitivity: "base"
        })
      );
    }
    const total = sorted.reduce((n, g) => n + g.entries.length, 0);
    const hasSubfolders = sorted.some((g) => g.folder !== here);
    let item = 0;
    const number = () => byDate ? total - item++ : ++item;
    return /* @__PURE__ */ jsx("section", { class: `folder-tree ${displayClass ?? ""}`, children: /* @__PURE__ */ jsxs("table", { class: "bom", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { scope: "col", class: "num", children: "Item" }),
        /* @__PURE__ */ jsx("th", { scope: "col", children: "Title" }),
        /* @__PURE__ */ jsx("th", { scope: "col", children: byDate ? "Date" : "Updated" }),
        /* @__PURE__ */ jsx("th", { scope: "col", class: "num", children: "Words" })
      ] }) }),
      sorted.map((group) => /* @__PURE__ */ jsxs("tbody", { children: [
        hasSubfolders && /* @__PURE__ */ jsx("tr", { class: "bom-group", children: /* @__PURE__ */ jsxs("th", { colSpan: 4, scope: "rowgroup", children: [
          group.folder === here ? "Loose sheets" : /* @__PURE__ */ jsx("a", { href: resolveRelative(slug, `${group.folder}/index`), children: group.names.join(" / ") }),
          /* @__PURE__ */ jsx("span", { class: "bom-count", children: group.entries.length })
        ] }) }),
        group.entries.map(({ f, date, words }) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { class: "num ref", children: number() }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", { href: resolveRelative(slug, f.slug), children: titleOf(f) }) }),
          /* @__PURE__ */ jsx("td", { class: "date", children: date && /* @__PURE__ */ jsx("time", { datetime: date.toISOString(), children: isoDate(date) }) }),
          /* @__PURE__ */ jsx("td", { class: "num", children: words.toLocaleString("en") })
        ] }))
      ] }))
    ] }) });
  };
  FolderTree.css = folderTree_default;
  return FolderTree;
});
export {
  FolderTree_default as FolderTree
};
