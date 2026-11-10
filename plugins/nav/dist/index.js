// src/components/Nav.tsx
import { resolveRelative } from "@quartz-community/utils";

// src/components/styles/nav.scss
var nav_default = ".site-nav{min-width:0}.site-nav ul{display:flex;gap:.25rem;margin:0;padding:0;list-style:none}.site-nav a{display:block;padding:.35rem .7rem;border-radius:999px;font-family:var(--bodyFont);font-size:.925rem;font-weight:500;line-height:1.25rem;white-space:nowrap;color:var(--darkgray);background-color:rgba(0,0,0,0);transition:color .15s ease,background-color .15s ease}.site-nav a:hover{color:var(--dark);background-color:var(--lightgray)}.site-nav a.active{color:var(--secondary);background-color:var(--highlight)}";

// src/components/Nav.tsx
import { jsx } from "preact/jsx-runtime";
var Nav_default = ((opts) => {
  const links = Object.entries(opts?.links ?? {}).map(([label, target]) => {
    const folder = target.endsWith("/");
    const slug = (folder ? `${target}index` : target).toLowerCase();
    return { label, slug, prefix: folder ? target.toLowerCase() : void 0 };
  });
  const Nav = ({ fileData, displayClass }) => {
    const current = fileData.slug ?? "";
    return /* @__PURE__ */ jsx("nav", { class: `site-nav ${displayClass ?? ""}`, "aria-label": "Site", children: /* @__PURE__ */ jsx("ul", { children: links.map(({ label, slug, prefix }) => {
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
    }) }) });
  };
  Nav.css = nav_default;
  return Nav;
});
export {
  Nav_default as Nav
};
