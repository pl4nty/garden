// src/components/Nav.tsx
import { resolveRelative } from "@quartz-community/utils";

// ../shared/pages.ts
import { getDate } from "@quartz-community/utils";
var titleOf = (f) => f.frontmatter?.title ?? f.slug ?? "";
function dateOf(f, cfg) {
  const type = f.defaultDateType ?? cfg.defaultDateType;
  if (!type) return void 0;
  return getDate({ ...f, defaultDateType: type });
}
var dayMonthYear = (date, locale) => date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
function newestFirst(allFiles, cfg, folders) {
  const prefixes = folders.map((folder) => `${folder.replace(/\/$/, "")}/`);
  return allFiles.filter((f) => {
    const slug = f.slug ?? "";
    return prefixes.some((prefix) => slug.startsWith(prefix)) && !slug.endsWith("/index");
  }).map((f) => ({ f, date: dateOf(f, cfg) })).filter((page) => Boolean(page.date)).sort((a, b) => b.date.getTime() - a.date.getTime());
}

// src/components/styles/nav.scss
var nav_default = ".site-index section{margin:0 0 1.75rem}.site-index h2{margin:0 0 .7rem;font-size:.95rem;font-weight:700;line-height:1.3;color:var(--dark)}.site-index ul{margin:0;padding:0;list-style:none}.site-index section li{margin:0 0 .7rem;line-height:1.3}.site-index section li a{display:block;font-family:var(--headerFont);font-size:1.02rem;font-weight:500;line-height:1.25;color:var(--dark);background-color:rgba(0,0,0,0);text-decoration:none;text-wrap:balance}.site-index section li a:hover{text-decoration:underline;text-decoration-color:var(--ink2);text-decoration-thickness:2px;text-underline-offset:.18em}.site-index time{display:block;margin-top:.15rem;font-size:.8rem;color:var(--gray)}.site-index .site-index-more{font-size:.875rem;font-weight:400;color:var(--gray);background-color:rgba(0,0,0,0);text-decoration:underline;text-decoration-color:var(--ink2);text-decoration-thickness:1.5px;text-underline-offset:.2em}.site-index .site-index-more:hover{color:var(--dark)}.site-links{display:flex;flex-wrap:wrap;gap:.2rem 0;margin:0 -0.3rem}.site-links a{display:block;padding:.1rem .3rem;font-size:.9rem;font-weight:400;color:var(--darkgray);background-color:rgba(0,0,0,0);text-decoration:none}.site-links a:hover{text-decoration:underline;text-decoration-color:var(--ink2);text-decoration-thickness:2px;text-underline-offset:.18em}.site-links a.active{font-weight:700;color:#1b2b22;background-color:var(--ink2)}";

// src/components/Nav.tsx
import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
var defaultOptions = {
  part: "sidebar",
  links: {},
  featured: [],
  postsFolder: "posts",
  notesFolder: "notes",
  recentCount: 5
};
var Nav_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const links = Object.entries(options.links).map(([label, target]) => {
    const folder = target.endsWith("/");
    const slug = (folder ? `${target}index` : target).toLowerCase();
    return { label, slug, prefix: folder ? target.toLowerCase() : void 0 };
  });
  const Nav = ({
    fileData,
    allFiles,
    cfg,
    displayClass
  }) => {
    const current = fileData.slug ?? "";
    if (options.part === "home" && current !== "index") return null;
    const locale = cfg.locale || "en-US";
    const href = (slug) => resolveRelative(current, slug);
    const posts = newestFirst(allFiles, cfg, [options.postsFolder]);
    const notes = newestFirst(allFiles, cfg, [options.notesFolder]);
    const featured = options.featured.map((slug) => allFiles.find((f) => f.slug === slug)).filter((f) => f !== void 0);
    const recent = notes.slice(0, options.recentCount).map(({ f }) => f);
    const list = (heading, pages, more, folder) => /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { children: heading }),
      /* @__PURE__ */ jsx("ul", { children: pages.map((f) => {
        const date = dateOf(f, cfg);
        return /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("a", { href: href(f.slug), "aria-current": f.slug === current ? "page" : void 0, children: titleOf(f) }),
          date && /* @__PURE__ */ jsx("time", { datetime: date.toISOString(), children: dayMonthYear(date, locale) })
        ] });
      }) }),
      more > 0 && /* @__PURE__ */ jsxs("a", { class: "site-index-more", href: href(`${folder.replace(/\/$/, "")}/index`), children: [
        "See ",
        more,
        " more \u2192"
      ] })
    ] });
    const lists = /* @__PURE__ */ jsxs(Fragment, { children: [
      featured.length > 0 && list("Selected writing", featured, posts.length - featured.length, options.postsFolder),
      recent.length > 0 && list("Recent notes", recent, notes.length - recent.length, options.notesFolder)
    ] });
    if (options.part === "home") {
      return /* @__PURE__ */ jsx("div", { class: `site-index site-index-home ${displayClass ?? ""}`, children: lists });
    }
    return /* @__PURE__ */ jsxs("nav", { class: `site-index ${displayClass ?? ""}`, "aria-label": "Site", children: [
      lists,
      /* @__PURE__ */ jsx("ul", { class: "site-links", children: links.map(({ label, slug, prefix }) => {
        const inside = prefix !== void 0 && current.startsWith(prefix);
        return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "a",
          {
            href: href(slug),
            class: current === slug || inside ? "active" : void 0,
            "aria-current": current === slug ? "page" : void 0,
            children: label
          }
        ) });
      }) })
    ] });
  };
  Nav.css = nav_default;
  return Nav;
});
export {
  Nav_default as Nav
};
