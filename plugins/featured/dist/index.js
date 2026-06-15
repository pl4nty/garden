// Hand-authored compiled output (mirrors what tsup would emit). Quartz loads
// dist/ at runtime; keep it in sync with ../src when editing.
import { getDate, formatDate, resolveRelative } from "@quartz-community/utils";

// preact jsx-runtime (inlined so the plugin doesn't depend on module resolution)
var l;
l = {
  __e: function (n2, l2, u3, t2) {
    for (var i2, r2, o2; (l2 = l2.__); )
      if ((i2 = l2.__c) && !i2.__)
        try {
          if (
            (r2 = i2.constructor) &&
            null != r2.getDerivedStateFromError &&
            (i2.setState(r2.getDerivedStateFromError(n2)), (o2 = i2.__d)),
            null != i2.componentDidCatch &&
              (i2.componentDidCatch(n2, t2 || {}), (o2 = i2.__d)),
            o2
          )
            return (i2.__E = i2);
        } catch (l3) {
          n2 = l3;
        }
    throw n2;
  },
};
var f2 = 0;
function u2(e2, t2, n2, o2, i2, u3) {
  t2 || (t2 = {});
  var a2,
    c2,
    p2 = t2;
  if ("ref" in p2) for (c2 in ((p2 = {}), t2)) "ref" == c2 ? (a2 = t2[c2]) : (p2[c2] = t2[c2]);
  var l2 = {
    type: e2,
    props: p2,
    key: n2,
    ref: a2,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __c: null,
    constructor: void 0,
    __v: --f2,
    __i: -1,
    __u: 0,
    __source: i2,
    __self: u3,
  };
  if ("function" == typeof e2 && (a2 = e2.defaultProps))
    for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l.vnode && l.vnode(l2), l2;
}

// src/components/styles/featured.scss
var featured_default =
  ".featured {\n  margin: 0 0 0.4rem 0;\n}\n.featured .featured-title {\n  font-family: var(--headerFont);\n  font-size: 0.95rem;\n  font-weight: 600;\n  color: var(--secondary);\n  margin: 0 0 0.5rem 0;\n  line-height: 1.5rem;\n}\n.featured .featured-list {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.featured .featured-item {\n  margin: 0 0 0.7rem 0;\n}\n.featured .featured-link {\n  display: block;\n  font-family: var(--headerFont);\n  font-weight: 600;\n  font-size: 0.95rem;\n  line-height: 1.3;\n  color: var(--dark);\n  background-color: transparent;\n}\n.featured .featured-link:hover {\n  color: var(--tertiary);\n}\n.featured .featured-date {\n  display: block;\n  margin-top: 0.1rem;\n  font-size: 0.8rem;\n  color: var(--gray);\n}\n.featured .featured-more {\n  display: inline-block;\n  margin-top: 0.1rem;\n  font-family: var(--headerFont);\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: var(--secondary);\n  background-color: transparent;\n}\n.featured .featured-more:hover {\n  color: var(--tertiary);\n}";

// src/components/Featured.tsx
var defaultOptions = {
  title: "Featured",
  posts: [],
  folder: "posts",
  showMore: true,
};
var Featured_default = (opts) => {
  const options = { ...defaultOptions, ...opts };
  const folderPrefix = options.folder.endsWith("/") ? options.folder : `${options.folder}/`;
  const Featured = ({ fileData, allFiles, cfg, displayClass }) => {
    if (fileData.slug !== "index") return null;
    const locale = cfg.locale || "en-US";
    const cfgDefaultDateType = cfg.defaultDateType;
    const bySlug = new Map(allFiles.map((f) => [f.slug, f]));
    const featured = options.posts.map((slug) => bySlug.get(slug)).filter(Boolean);
    if (featured.length === 0) return null;
    const totalInFolder = allFiles.filter(
      (f) =>
        f.slug &&
        f.slug.startsWith(folderPrefix) &&
        f.slug !== `${folderPrefix}index` &&
        !f.slug.endsWith("/index"),
    ).length;
    const moreCount = Math.max(totalInFolder - featured.length, 0);
    const folderHref = resolveRelative(fileData.slug, `${folderPrefix}index`);
    return u2("div", {
      class: `featured ${displayClass ?? ""}`,
      children: [
        u2("h2", { class: "featured-title", children: options.title }),
        u2("ul", {
          class: "featured-list",
          children: featured.map((f) => {
            const href = resolveRelative(fileData.slug, f.slug);
            const title = f.frontmatter?.title ?? f.slug;
            const data = { ...f, defaultDateType: f.defaultDateType ?? cfgDefaultDateType };
            const date = data.defaultDateType ? getDate(data) : void 0;
            return u2(
              "li",
              {
                class: "featured-item",
                children: [
                  u2("a", { href, class: "featured-link", children: title }),
                  date
                    ? u2("time", {
                        class: "featured-date",
                        datetime: date.toISOString(),
                        children: formatDate(date, locale),
                      })
                    : null,
                ],
              },
              f.slug,
            );
          }),
        }),
        options.showMore && moreCount > 0
          ? u2("a", {
              class: "featured-more",
              href: folderHref,
              children: `See ${moreCount} more →`,
            })
          : null,
      ],
    });
  };
  Featured.css = featured_default;
  return Featured;
};

export { Featured_default as Featured };
