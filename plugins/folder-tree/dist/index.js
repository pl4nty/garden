// src/components/FolderTree.tsx
import { resolveRelative } from "@quartz-community/utils";

// ../shared/listing.tsx
import { getDate } from "@quartz-community/utils";
import { jsx, jsxs } from "preact/jsx-runtime";
var isoDate = (d) => d.toISOString().slice(0, 10);
var wordCount = (f) => (f.text ?? "").split(/\s+/).filter(Boolean).length;
function humanSize(n) {
  if (n < 1e3) return String(n);
  const k = n / 1e3;
  return k < 9.95 ? `${k.toFixed(1)}k` : `${Math.round(k)}k`;
}
function dateOf(f, cfg) {
  const fallback = cfg.defaultDateType;
  const data = { ...f, defaultDateType: f.defaultDateType ?? fallback };
  return data.defaultDateType ? getDate(data) : void 0;
}
var titleOf = (f) => f.frontmatter?.title ?? f.slug ?? "";
function LsRows({ rows }) {
  return /* @__PURE__ */ jsx("ul", { class: "ls", children: rows.map(({ href, title, date, words }) => /* @__PURE__ */ jsxs("li", { children: [
    date ? /* @__PURE__ */ jsx("time", { datetime: date.toISOString(), children: isoDate(date) }) : /* @__PURE__ */ jsx("span", {}),
    /* @__PURE__ */ jsx("span", { class: "ls-size", title: `${words.toLocaleString("en")} words`, children: humanSize(words) }),
    /* @__PURE__ */ jsx("a", { href, children: title })
  ] })) });
}
function Cmd({ children, label }) {
  return /* @__PURE__ */ jsx("h2", { class: "cmd", "aria-label": label, children });
}

// src/components/styles/folderTree.scss
var folderTree_default = '.tree ul{margin:0;padding:0;list-style:none}.tree li{position:relative;margin:0;padding-left:4ch}.tree li::before,.tree li::after{position:absolute;left:0;white-space:pre;pointer-events:none}.tree li::before{content:"\u251C\u2500\u2500 ";top:0}.tree li:last-child::before{content:"\u2514\u2500\u2500 "}.tree li::after{content:"\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a\u2502\\a";top:0;bottom:0;overflow:hidden;line-height:1.2}.tree li:last-child::after{bottom:auto;height:calc(var(--row, 1.6em)/2 - .3em)}';

// src/components/FolderTree.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "preact/jsx-runtime";
var defaultOptions = {
  trees: ["notes"],
  lists: []
};
var plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
var FolderTree_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const clean = (roots) => roots.map((r) => r.replace(/\/$/, "").toLowerCase());
  const trees = clean(options.trees);
  const lists = clean(options.lists);
  const below = (roots, folder) => roots.some((r) => folder === r || folder.startsWith(`${r}/`));
  const FolderTree = ({
    fileData,
    allFiles,
    cfg,
    displayClass
  }) => {
    const slug = fileData.slug ?? "";
    if (!slug.endsWith("/index")) return null;
    const here = slug.slice(0, -"/index".length);
    const href = (to) => resolveRelative(slug, to);
    const locale = cfg.locale || "en-US";
    const pages = allFiles.filter((f) => {
      const s = f.slug;
      return s && s.startsWith(`${here}/`) && !s.endsWith("/index");
    });
    if (pages.length === 0) return null;
    if (below(lists, here)) {
      const rows = pages.map((f) => ({
        href: href(f.slug),
        title: titleOf(f),
        date: dateOf(f, cfg),
        words: wordCount(f)
      })).sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
      return /* @__PURE__ */ jsxs2("section", { class: `folder-ls ${displayClass ?? ""}`, children: [
        /* @__PURE__ */ jsxs2(Cmd, { label: `${rows.length} pages, newest first`, children: [
          "ls -lt ~/",
          here
        ] }),
        /* @__PURE__ */ jsxs2("p", { class: "ls-total", children: [
          "total ",
          rows.length
        ] }),
        /* @__PURE__ */ jsx2(LsRows, { rows })
      ] });
    }
    if (!below(trees, here)) return null;
    const root = { name: here, slug: here, dirs: /* @__PURE__ */ new Map(), files: [] };
    let dirCount = 0;
    for (const f of pages) {
      const parts = f.slug.slice(here.length + 1).split("/");
      let dir = root;
      for (const part of parts.slice(0, -1)) {
        let next = dir.dirs.get(part);
        if (!next) {
          next = { name: part, slug: `${dir.slug}/${part}`, dirs: /* @__PURE__ */ new Map(), files: [] };
          dir.dirs.set(part, next);
          dirCount++;
        }
        dir = next;
      }
      dir.files.push(f);
    }
    const list = (dir) => /* @__PURE__ */ jsxs2("ul", { children: [
      [...dir.dirs.values()].sort((a, b) => a.name.localeCompare(b.name, locale)).map((d) => /* @__PURE__ */ jsxs2("li", { children: [
        /* @__PURE__ */ jsxs2("a", { class: "tree-dir", href: href(`${d.slug}/index`), children: [
          d.name,
          "/"
        ] }),
        list(d)
      ] })),
      dir.files.sort(
        (a, b) => titleOf(a).localeCompare(titleOf(b), locale, { numeric: true, sensitivity: "base" })
      ).map((f) => /* @__PURE__ */ jsx2("li", { children: /* @__PURE__ */ jsx2("a", { href: href(f.slug), children: titleOf(f) }) }))
    ] });
    return /* @__PURE__ */ jsxs2("section", { class: `folder-tree ${displayClass ?? ""}`, children: [
      /* @__PURE__ */ jsxs2(Cmd, { label: `${pages.length} notes, by folder`, children: [
        "tree --dirsfirst ~/",
        here
      ] }),
      /* @__PURE__ */ jsxs2("div", { class: "tree", children: [
        /* @__PURE__ */ jsxs2("p", { children: [
          "~/",
          here
        ] }),
        list(root)
      ] }),
      /* @__PURE__ */ jsxs2("p", { class: "tree-total", children: [
        plural(dirCount, "directory", "directories"),
        ", ",
        plural(pages.length, "file", "files")
      ] })
    ] });
  };
  FolderTree.css = folderTree_default;
  return FolderTree;
});
export {
  FolderTree_default as FolderTree
};
