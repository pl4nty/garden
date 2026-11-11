// src/components/styles/socials.scss
var socials_default = '.socials .socials-label{margin:0 0 .35rem;font-family:var(--headerFont);font-size:.78rem;font-weight:500;line-height:1.3;color:var(--label)}.socials ul{display:flex;flex-wrap:wrap;gap:.35rem .4rem;margin:0;padding:0;list-style:none}.socials li{margin:0}.socials .social-link{--point: 0.55rem;position:relative;display:block;padding:.14rem calc(var(--point) + .3rem) .14rem .4rem;font-family:var(--codeFont);font-size:.72rem;line-height:1.4;color:var(--tertiary);background-color:var(--rule);text-decoration:none;clip-path:polygon(0 0, calc(100% - var(--point)) 0, 100% 50%, calc(100% - var(--point)) 100%, 0 100%)}.socials .social-link::before{content:"";position:absolute;inset:1px;z-index:-1;background-color:var(--light);clip-path:polygon(0 0, calc(100% - var(--point) + 0.5px) 0, calc(100% - 0.4px) 50%, calc(100% - var(--point) + 0.5px) 100%, 0 100%)}.socials .social-link:hover::before,.socials .social-link:focus-visible::before{background-color:var(--fill)}.socials .social-link:focus-visible{outline:none;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.15em}';

// src/components/Socials.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var Socials_default = ((opts) => {
  const Socials = ({ displayClass }) => {
    const links = opts?.links ?? {};
    return /* @__PURE__ */ jsxs("nav", { class: `socials ${displayClass ?? ""}`, "aria-labelledby": "socials-label", children: [
      /* @__PURE__ */ jsx("p", { class: "socials-label", id: "socials-label", children: "Off sheet" }),
      /* @__PURE__ */ jsx("ul", { children: Object.entries(links).map(([label, url]) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: url, class: "social-link", target: "_blank", rel: "noopener noreferrer me", children: label }) })) })
    ] });
  };
  Socials.css = socials_default;
  return Socials;
});
export {
  Socials_default as Socials
};
