// ../shared/listing.tsx
import { getDate } from "@quartz-community/utils";
import { jsx, jsxs } from "preact/jsx-runtime";
var isoDate = (d) => d.toISOString().slice(0, 10);
function dateOf(f, cfg) {
  const fallback = cfg.defaultDateType;
  const data = { ...f, defaultDateType: f.defaultDateType ?? fallback };
  return data.defaultDateType ? getDate(data) : void 0;
}

// src/components/styles/footer.scss
var footer_default = "footer .man-foot{grid-template-columns:auto 1fr auto;gap:0 1ch;white-space:nowrap}footer .man-foot>:nth-child(2){text-align:center}@media(max-width: 800px){footer .man-foot{grid-template-columns:1fr auto;white-space:normal}footer .man-foot>:nth-child(2){text-align:right}footer .man-foot>:last-child{grid-column:1/-1;text-align:left;overflow-wrap:anywhere}}footer ul{display:flex;flex-wrap:wrap;gap:0 2ch;margin:0;padding:0;list-style:none}footer ul .credit{margin-left:auto}";

// src/components/Footer.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "preact/jsx-runtime";
var Footer_default = ((opts) => {
  const site = opts?.site ?? "";
  const links = opts?.links ?? {};
  const fallback = opts?.defaultSection ?? 7;
  const sections = Object.entries(opts?.sections ?? {}).map(([prefix, n]) => [prefix.replace(/\/$/, "").toLowerCase(), n]).sort((a, b) => b[0].length - a[0].length);
  const Footer = ({ fileData, cfg, displayClass }) => {
    const slug = (fileData.slug ?? "").replace(/\/index$/, "");
    const section = sections.find(([prefix]) => slug === prefix || slug.startsWith(`${prefix}/`))?.[1] ?? fallback;
    const date = dateOf(fileData, cfg);
    return /* @__PURE__ */ jsxs2("footer", { class: `${displayClass ?? ""}`, children: [
      /* @__PURE__ */ jsxs2("p", { class: "man-line man-foot", children: [
        /* @__PURE__ */ jsx2("span", { children: site || cfg.baseUrl }),
        /* @__PURE__ */ jsx2("span", { children: date && /* @__PURE__ */ jsx2("time", { datetime: date.toISOString(), children: isoDate(date) }) }),
        /* @__PURE__ */ jsxs2("span", { children: [
          slug,
          "(",
          section,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("ul", { children: [
        Object.entries(links).map(([text, link]) => /* @__PURE__ */ jsx2("li", { children: /* @__PURE__ */ jsx2("a", { href: link, children: text }) })),
        /* @__PURE__ */ jsxs2("li", { class: "credit", children: [
          "cultivated with ",
          /* @__PURE__ */ jsx2("a", { href: "https://obsidian.md/", children: "Obsidian" }),
          " and",
          " ",
          /* @__PURE__ */ jsx2("a", { href: "https://quartz.jzhao.xyz/", children: "Quartz" })
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
