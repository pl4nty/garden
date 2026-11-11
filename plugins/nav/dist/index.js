// src/components/Nav.tsx
import { resolveRelative } from "@quartz-community/utils";

// src/components/styles/nav.scss
var nav_default = ".site-name h1{margin:0;font-size:inherit;font-weight:600;line-height:inherit;color:inherit}.site-name p{margin:0;line-height:inherit;opacity:.8}.site-back a{display:inline-flex;align-items:center;gap:.5em;color:inherit;text-decoration:none}.site-back a:hover{text-decoration:underline;text-underline-offset:.25em}.site-back a svg{flex:none;fill:none;stroke:currentColor;stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round}";

// src/components/Nav.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
function parentOf(slug) {
  const parts = slug.split("/");
  if (parts[parts.length - 1] === "index") parts.pop();
  parts.pop();
  return parts.length === 0 ? "index" : `${parts.join("/")}/index`;
}
var Nav_default = ((opts) => {
  const Nav = ({
    fileData,
    allFiles,
    cfg,
    displayClass
  }) => {
    const slug = fileData.slug ?? "index";
    if (slug === "index") {
      return /* @__PURE__ */ jsxs("div", { class: `site-name ${displayClass ?? ""}`, children: [
        /* @__PURE__ */ jsx("h1", { children: cfg.pageTitle }),
        opts?.descriptor && /* @__PURE__ */ jsx("p", { children: opts.descriptor })
      ] });
    }
    const parent = parentOf(slug);
    const page = allFiles.find((f) => f.slug === parent);
    const name = parent === "index" ? "the garden" : page?.frontmatter?.title ?? parent.split("/").slice(-2)[0];
    return /* @__PURE__ */ jsx("nav", { class: `site-back ${displayClass ?? ""}`, "aria-label": "Site", children: /* @__PURE__ */ jsxs("a", { href: resolveRelative(slug, parent), "aria-label": `Back to ${name}`, children: [
      /* @__PURE__ */ jsx("svg", { viewBox: "0 0 16 16", width: "13", height: "13", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M14 8H2.5M7 3.5 2.5 8 7 12.5" }) }),
      "Back"
    ] }) });
  };
  Nav.css = nav_default;
  return Nav;
});
export {
  Nav_default as Nav
};
