// src/components/Nav.tsx
import { resolveRelative } from "@quartz-community/utils";

// src/components/styles/nav.scss
var nav_default = '.site-nav .site-nav-label{margin:0 0 .3rem;font-family:var(--headerFont);font-size:.78rem;font-weight:500;line-height:1.3;color:var(--label)}.site-nav ol{margin:0;padding:0;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);list-style:none;counter-reset:sheet}.site-nav li{margin:0;counter-increment:sheet}.site-nav li+li{border-top:1px solid var(--lightgray)}.site-nav a{display:flex;align-items:baseline;gap:.7rem;padding:.3rem 0;font-family:var(--headerFont);font-size:1.02rem;font-weight:500;line-height:1.4;color:var(--darkgray);background-color:rgba(0,0,0,0);text-decoration:none}.site-nav a::before{content:counter(sheet);flex:none;width:.9rem;font-family:var(--codeFont);font-size:.72rem;font-weight:400;color:var(--label)}.site-nav a:hover{text-decoration:underline;text-decoration-color:var(--wire);text-decoration-thickness:1.5px;text-underline-offset:.22em}.site-nav .active>a{font-weight:600;color:var(--dark)}.site-nav .active>a::after{content:"";flex:none;align-self:center;width:7px;height:7px;margin-left:auto;border-radius:50%;background-color:var(--wire)}.site-nav .here{position:relative;display:block;margin:-0.1rem 0 .4rem .3rem;padding-left:1.3rem;font-family:var(--headerFont);font-size:.88rem;font-weight:500;line-height:1.3;color:var(--gray)}.site-nav .here::before{content:"";position:absolute;left:0;top:-0.15rem;width:.8rem;height:.75rem;border-left:1px solid var(--wire);border-bottom:1px solid var(--wire)}';

// src/components/Nav.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var Nav_default = ((opts) => {
  const links = Object.entries(opts?.links ?? {}).map(([label, target]) => {
    const folder = target.endsWith("/");
    const slug = (folder ? `${target}index` : target).toLowerCase();
    return { label, slug, prefix: folder ? target.toLowerCase() : void 0 };
  });
  const Nav = ({ fileData, displayClass }) => {
    const current = fileData.slug ?? "";
    return /* @__PURE__ */ jsxs("nav", { class: `site-nav ${displayClass ?? ""}`, "aria-labelledby": "site-nav-label", children: [
      /* @__PURE__ */ jsx("p", { class: "site-nav-label", id: "site-nav-label", children: "Sheets" }),
      /* @__PURE__ */ jsx("ol", { children: links.map(({ label, slug, prefix }) => {
        const inside = prefix !== void 0 && current.startsWith(prefix);
        const active = current === slug || inside;
        const here = inside && !current.endsWith("/index") ? fileData.frontmatter?.title : null;
        return /* @__PURE__ */ jsxs("li", { class: active ? "active" : void 0, children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: resolveRelative(current, slug),
              "aria-current": current === slug ? "page" : void 0,
              children: label
            }
          ),
          here && /* @__PURE__ */ jsx("span", { class: "here", children: here })
        ] });
      }) })
    ] });
  };
  Nav.css = nav_default;
  return Nav;
});
export {
  Nav_default as Nav
};
