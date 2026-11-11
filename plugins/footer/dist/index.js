// src/components/Footer.tsx
import { resolveRelative } from "@quartz-community/utils";

// src/components/styles/footer.scss
var footer_default = 'footer ul{display:flex;flex-wrap:wrap;gap:0 .6em;margin:0;padding:0;list-style:none}footer li:not(:last-child)::after{content:"\xB7";margin-left:.6em}';

// src/components/Footer.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var Footer_default = ((opts) => {
  const pages = Object.entries(opts?.pages ?? {}).map(([label, target]) => ({
    label,
    slug: target === "" ? "index" : target.endsWith("/") ? `${target}index` : target
  }));
  const links = Object.entries(opts?.links ?? {});
  const Footer = ({ fileData, displayClass }) => {
    const current = fileData.slug ?? "index";
    const to = (slug) => resolveRelative(current, slug);
    return /* @__PURE__ */ jsxs("footer", { class: `${displayClass ?? ""}`, children: [
      /* @__PURE__ */ jsx("nav", { "aria-label": "Pages", children: /* @__PURE__ */ jsxs("ul", { children: [
        pages.map(({ label, slug }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: to(slug), "aria-current": current === slug ? "page" : void 0, children: label }) })),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: to("index.xml"), "data-router-ignore": true, children: "rss" }) })
      ] }) }),
      /* @__PURE__ */ jsxs("ul", { class: "footer-out", children: [
        links.map(([label, url]) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: url, children: label }) })),
        /* @__PURE__ */ jsxs("li", { children: [
          "cultivated with ",
          /* @__PURE__ */ jsx("a", { href: "https://obsidian.md/", children: "Obsidian" }),
          " and",
          " ",
          /* @__PURE__ */ jsx("a", { href: "https://quartz.jzhao.xyz/", children: "Quartz" })
        ] })
      ] })
    ] });
  };
  Footer.css = footer_default;
  return Footer;
});
export {
  Footer_default as Footer
};
