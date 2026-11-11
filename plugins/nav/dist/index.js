// src/components/Nav.tsx
import { resolveRelative } from "@quartz-community/utils";

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

// src/components/styles/nav.scss
var nav_default = ".site-nav ul{display:flex;flex-direction:column;gap:.2rem;margin:0;padding:0;list-style:none}.site-nav a{color:var(--gray);background-color:rgba(0,0,0,0);text-decoration:none;transition:color .15s ease}.site-nav a:hover,.site-nav a.active{color:var(--dark)}.site-nav .here{display:block;margin:.1rem 0 .3rem 1rem;font-size:.9em;line-height:1.35;color:var(--dark)}";

// src/components/Nav.tsx
import { jsx as jsx2, jsxs } from "preact/jsx-runtime";
var Nav_default = ((opts) => {
  const links = Object.entries(opts?.links ?? {}).map(([label, target]) => {
    const folder = target.endsWith("/");
    const slug = (folder ? `${target}index` : target).toLowerCase();
    return { label, slug, prefix: folder ? target.toLowerCase() : void 0 };
  });
  const Nav = ({ fileData, displayClass }) => {
    const current = fileData.slug ?? "";
    return /* @__PURE__ */ jsx2("nav", { class: `site-nav ${displayClass ?? ""}`, "aria-label": "Site", children: /* @__PURE__ */ jsx2("ul", { children: links.map(({ label, slug, prefix }) => {
      const inside = prefix !== void 0 && current.startsWith(prefix);
      const active = current === slug || inside;
      const here = inside && !current.endsWith("/index") ? fileData.frontmatter?.title : null;
      return /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx2(
          "a",
          {
            href: resolveRelative(current, slug),
            class: active ? "active" : void 0,
            "aria-current": current === slug ? "page" : void 0,
            children: label
          }
        ),
        here && /* @__PURE__ */ jsx2("span", { class: "here", children: smallCaps(here) })
      ] });
    }) }) });
  };
  Nav.css = nav_default;
  return Nav;
});
export {
  Nav_default as Nav
};
