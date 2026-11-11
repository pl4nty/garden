// src/components/Home.tsx
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

// src/components/styles/home.scss
var home_default = ".home-listing section{margin:0}";

// src/components/Home.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "preact/jsx-runtime";
var defaultOptions = {
  section: "listing",
  postsFolder: "posts",
  notesFolder: "notes",
  recentCount: 8
};
var Home_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const posts = options.postsFolder.replace(/\/$/, "");
  const notes = options.notesFolder.replace(/\/$/, "");
  const Home = ({
    fileData,
    allFiles,
    cfg,
    displayClass
  }) => {
    if (fileData.slug !== "index") return null;
    if (options.section === "head") {
      return /* @__PURE__ */ jsx2("p", { class: `cmd ${displayClass ?? ""}`, "aria-hidden": "true", children: "cat ~/index.md" });
    }
    const href = (slug) => resolveRelative(fileData.slug, slug);
    const newestFirst = (folder) => allFiles.filter((f) => f.slug?.startsWith(`${folder}/`) && !f.slug.endsWith("/index")).map((f) => ({ f, date: dateOf(f, cfg) })).filter((n) => Boolean(n.date)).sort((a, b) => b.date.getTime() - a.date.getTime());
    const rows = (items) => items.map(({ f, date }) => ({
      href: href(f.slug),
      title: titleOf(f),
      date,
      words: wordCount(f)
    }));
    const allPosts = newestFirst(posts);
    const allNotes = newestFirst(notes);
    const recent = allNotes.slice(0, options.recentCount);
    return /* @__PURE__ */ jsxs2("div", { class: `home-listing ${displayClass ?? ""}`, children: [
      allPosts.length > 0 && /* @__PURE__ */ jsxs2("section", { children: [
        /* @__PURE__ */ jsxs2(Cmd, { label: "Posts, newest first", children: [
          "ls -lt ",
          /* @__PURE__ */ jsxs2("a", { href: href(`${posts}/index`), children: [
            "~/",
            posts
          ] })
        ] }),
        /* @__PURE__ */ jsx2(LsRows, { rows: rows(allPosts) })
      ] }),
      recent.length > 0 && /* @__PURE__ */ jsxs2("section", { children: [
        /* @__PURE__ */ jsxs2(Cmd, { label: "Notes, most recently tended first", children: [
          "ls -lt ",
          /* @__PURE__ */ jsxs2("a", { href: href(`${notes}/index`), children: [
            "~/",
            notes
          ] }),
          " | head -n ",
          recent.length
        ] }),
        /* @__PURE__ */ jsx2(LsRows, { rows: rows(recent) }),
        allNotes.length > recent.length && /* @__PURE__ */ jsxs2("p", { class: "home-more", children: [
          allNotes.length - recent.length,
          " more in",
          " ",
          /* @__PURE__ */ jsxs2("a", { href: href(`${notes}/index`), children: [
            "~/",
            notes
          ] })
        ] })
      ] })
    ] });
  };
  Home.css = home_default;
  return Home;
});
export {
  Home_default as Home
};
