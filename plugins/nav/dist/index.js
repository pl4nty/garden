// src/components/Nav.tsx
import { resolveRelative } from "@quartz-community/utils";

// src/components/styles/nav.scss
var nav_default = ".man-line{display:grid;grid-template-columns:1fr auto 1fr;gap:0 2ch}.man-line>:last-child{text-align:right}.site-nav ul{display:flex;flex-wrap:wrap;gap:0 2ch;margin:0;padding:0;list-style:none}@media(max-width: 800px){.site-nav ul{gap:0 1ch}}";

// src/components/Nav.tsx
import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
var Nav_default = ((opts) => {
  const name = `${opts?.name ?? "SITE"}(${opts?.section ?? 7})`;
  const links = Object.entries(opts?.links ?? {}).map(([label, target]) => {
    const folder = target.endsWith("/");
    const slug = (folder ? `${target}index` : target).toLowerCase();
    return { label, slug, prefix: folder ? target.toLowerCase() : void 0 };
  });
  const Nav = ({ fileData, cfg, displayClass }) => {
    const current = fileData.slug ?? "";
    const title = cfg.pageTitle;
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(
        "a",
        {
          class: `man-line man-head ${displayClass ?? ""}`,
          href: resolveRelative(current, "index"),
          "aria-label": `${title}: home`,
          children: [
            /* @__PURE__ */ jsx("span", { children: name }),
            /* @__PURE__ */ jsx("span", { children: title }),
            /* @__PURE__ */ jsx("span", { children: name })
          ]
        }
      ),
      /* @__PURE__ */ jsx("nav", { class: `site-nav ${displayClass ?? ""}`, "aria-label": "Site", children: /* @__PURE__ */ jsx("ul", { children: links.map(({ label, slug, prefix }) => {
        const active = current === slug || prefix !== void 0 && current.startsWith(prefix);
        return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "a",
          {
            href: resolveRelative(current, slug),
            class: active ? "active" : void 0,
            "aria-current": current === slug ? "page" : void 0,
            children: label
          }
        ) });
      }) }) })
    ] });
  };
  Nav.css = nav_default;
  return Nav;
});
export {
  Nav_default as Nav
};
