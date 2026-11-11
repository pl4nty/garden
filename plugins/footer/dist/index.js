// src/components/Footer.tsx
import { getDate } from "@quartz-community/utils";

// src/components/revisions.ts
import { execFileSync } from "node:child_process";
var cache = /* @__PURE__ */ new Map();
function revisions(dir) {
  const known = cache.get(dir);
  if (known) return known;
  const counts = /* @__PURE__ */ new Map();
  try {
    const out = execFileSync(
      "git",
      ["-c", "core.quotepath=off", "log", "--format=", "--name-only", "--", dir],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }
    );
    for (const line of out.split("\n")) {
      if (line) counts.set(line, (counts.get(line) ?? 0) + 1);
    }
  } catch {
  }
  cache.set(dir, counts);
  return counts;
}

// src/components/styles/footer.scss
var footer_default = '.sheet{opacity:1;text-align:left}.sheet-frame{position:fixed;inset:0;z-index:20;max-width:var(--sheet-max);margin:0 auto;pointer-events:none;font-family:var(--headerFont);font-size:.625rem;font-weight:500;line-height:1;color:var(--rule)}.sheet-frame::before,.sheet-frame::after{content:"";position:absolute;z-index:1;border:1px solid var(--rule)}.sheet-frame::before{inset:var(--frame-m)}.sheet-frame::after{inset:calc(var(--frame) - 2px);border-width:2px}@media(max-width: 800px){.sheet-frame{display:none}}.sheet-zones{position:absolute;display:flex;box-sizing:border-box;background-color:var(--light)}.sheet-zones>span{flex:1;display:flex;align-items:center;justify-content:center}.sheet-zones.top,.sheet-zones.bottom{left:0;right:0;height:var(--frame)}.sheet-zones.top>span+span,.sheet-zones.bottom>span+span{border-left:1px solid var(--rule)}.sheet-zones.top{top:0;padding:var(--frame-m) var(--frame) 0}.sheet-zones.bottom{bottom:0;padding:0 var(--frame) var(--frame-m)}.sheet-zones.left,.sheet-zones.right{top:var(--frame);bottom:var(--frame);flex-direction:column;width:var(--frame)}.sheet-zones.left>span+span,.sheet-zones.right>span+span{border-top:1px solid var(--rule)}.sheet-zones.left{left:0;padding-left:var(--frame-m)}.sheet-zones.right{right:0;padding-right:var(--frame-m)}.title-block{display:grid;grid-template-columns:repeat(12, minmax(0, 1fr));gap:1px;box-sizing:border-box;margin:0;border:2px solid var(--rule);background-color:var(--rule);font-family:var(--headerFont);font-variant-numeric:lining-nums tabular-nums;color:var(--dark)}.title-block>div{grid-column:span 12;min-width:0;padding:.28rem .45rem .34rem;background-color:var(--light)}.title-block>.tb-date,.title-block>.tb-licence{grid-column:span 4}.title-block>.tb-size,.title-block>.tb-tool{grid-column:span 5}.title-block>.tb-rev,.title-block>.tb-drawn{grid-column:span 3}.title-block dt{margin:0;font-size:.66rem;font-weight:500;line-height:1.25;color:var(--label)}.title-block dd{margin:0;font-size:.84rem;font-weight:500;line-height:1.3;overflow-wrap:anywhere}.title-block a{color:inherit;background-color:rgba(0,0,0,0);text-decoration:underline;text-decoration-color:var(--wire);text-decoration-thickness:1.5px;text-underline-offset:.18em}.title-block a:hover{color:var(--secondary)}.title-block .tb-site{padding-top:.4rem;padding-bottom:.4rem}.title-block .tb-site dt{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.title-block .tb-site dd{display:flex;align-items:center;gap:.4rem;font-size:1rem;font-weight:600}.title-block .tb-site dd>span{display:flex}.title-block .mark{width:1.25rem;height:1.25rem}.title-block .mark-plant{color:var(--wire)}.title-block .mark-earth{color:var(--rule)}.title-block .tb-sheet dd{font-family:var(--codeFont);font-size:.72rem;font-weight:400;line-height:1.4}.title-block .tb-title dd{font-size:1.06rem;font-weight:600;line-height:1.22;text-wrap:balance}@media(min-width: 801px){.title-block{width:var(--margin);border-right-width:0;border-bottom-width:0}}@media(min-width: 801px)and (max-width: 1199px){.sheet{display:flex;justify-content:flex-end}}@media(min-width: 1200px){.title-block{position:fixed;right:calc(max(0px,(100% - var(--sheet-max))/2) + var(--frame));bottom:var(--frame);z-index:21}}';

// src/components/Footer.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var defaultOptions = {
  site: "",
  drawnBy: "",
  repository: "",
  branch: "main"
};
var COLUMNS = ["1", "2", "3", "4", "5", "6"];
var ROWS = ["A", "B", "C", "D"];
var mark = '<svg class="mark" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke-linecap="square" aria-hidden="true"><g class="mark-plant" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 15.5V6"/><path fill="currentColor" d="M12 11.5Q7.2 12.3 4.5 6.5Q10.6 6.4 12 11.5Z"/><path fill="currentColor" d="M12 8Q11.6 3.6 18.5 1.5Q18.8 6.6 12 8Z"/></g><g class="mark-earth" stroke="currentColor" stroke-width="1.5"><path d="M5 16.25h14M8 19.5h8M10.75 22.75h2.5"/></g></svg>';
var words = (text) => text.split(/\s+/).filter(Boolean).length;
var isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
var Footer_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const repository = options.repository.replace(/\/$/, "");
  const Footer = ({
    fileData,
    allFiles,
    cfg,
    displayClass
  }) => {
    const slug = fileData.slug ?? "";
    const folder = slug === "index" ? void 0 : slug.match(/^(.*)\/index$/)?.[1];
    const title = fileData.frontmatter?.title ?? "";
    const sheet = slug === "index" ? "/" : folder !== void 0 ? `/${folder}/` : `/${slug}`;
    const cfgDateType = cfg.defaultDateType;
    const dateOf = (f) => {
      const data = { ...f, defaultDateType: f.defaultDateType ?? cfgDateType };
      return data.defaultDateType && data.dates ? getDate(data) : void 0;
    };
    const below = folder === void 0 ? [] : allFiles.filter((f) => {
      const s = f.slug ?? "";
      return s.startsWith(`${folder}/`) && !s.endsWith("/index");
    });
    const filePath = fileData.filePath;
    const fromFile = Boolean(filePath?.endsWith(".md") && fileData.text !== void 0);
    const count = fromFile ? words(fileData.text ?? "") : 0;
    const size = below.length > 0 ? `${below.length} ${below.length === 1 ? "sheet" : "sheets"}` : count > 0 ? `${count.toLocaleString("en")} ${count === 1 ? "word" : "words"}` : void 0;
    const date = below.length > 0 ? below.map(dateOf).filter((d) => Boolean(d)).sort((a, b) => b.getTime() - a.getTime())[0] : dateOf(fileData);
    const revision = fromFile ? revisions(filePath.split("/")[0]).get(filePath) : void 0;
    const history = fromFile && repository ? `${repository}/commits/${options.branch}/${filePath.split("/").map(encodeURIComponent).join("/")}` : void 0;
    return /* @__PURE__ */ jsxs("footer", { class: `sheet ${displayClass ?? ""}`, children: [
      /* @__PURE__ */ jsxs("div", { class: "sheet-frame", "aria-hidden": "true", children: [
        ["top", "bottom"].map((edge) => /* @__PURE__ */ jsx("div", { class: `sheet-zones ${edge}`, children: COLUMNS.map((zone) => /* @__PURE__ */ jsx("span", { children: zone })) })),
        ["left", "right"].map((edge) => /* @__PURE__ */ jsx("div", { class: `sheet-zones ${edge}`, children: ROWS.map((zone) => /* @__PURE__ */ jsx("span", { children: zone })) }))
      ] }),
      /* @__PURE__ */ jsxs("dl", { class: "title-block", "aria-label": "Title block", children: [
        /* @__PURE__ */ jsxs("div", { class: "tb-site", children: [
          /* @__PURE__ */ jsx("dt", { children: "Site" }),
          /* @__PURE__ */ jsxs("dd", { children: [
            /* @__PURE__ */ jsx("span", { dangerouslySetInnerHTML: { __html: mark } }),
            options.site
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "tb-sheet", children: [
          /* @__PURE__ */ jsx("dt", { children: "Sheet" }),
          /* @__PURE__ */ jsx("dd", { children: sheet })
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "tb-title", children: [
          /* @__PURE__ */ jsx("dt", { children: "Title" }),
          /* @__PURE__ */ jsx("dd", { children: title })
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "tb-date", children: [
          /* @__PURE__ */ jsx("dt", { children: "Date" }),
          /* @__PURE__ */ jsx("dd", { children: date ? /* @__PURE__ */ jsx("time", { datetime: date.toISOString(), children: isoDate(date) }) : "\u2013" })
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "tb-size", children: [
          /* @__PURE__ */ jsx("dt", { children: "Size" }),
          /* @__PURE__ */ jsx("dd", { children: size ?? "\u2013" })
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "tb-rev", children: [
          /* @__PURE__ */ jsx("dt", { children: "Rev" }),
          /* @__PURE__ */ jsx("dd", { children: history ? /* @__PURE__ */ jsx(
            "a",
            {
              href: history,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": revision ? `Revision ${revision}: history on GitHub` : "History on GitHub",
              children: revision ?? "history"
            }
          ) : "\u2013" })
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "tb-drawn", children: [
          /* @__PURE__ */ jsx("dt", { children: "Drawn by" }),
          /* @__PURE__ */ jsx("dd", { children: options.drawnBy })
        ] }),
        options.licence && /* @__PURE__ */ jsxs("div", { class: "tb-licence", children: [
          /* @__PURE__ */ jsx("dt", { children: "Licence" }),
          /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx("a", { href: options.licence.href, children: options.licence.label }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "tb-tool", children: [
          /* @__PURE__ */ jsx("dt", { children: "Tools" }),
          /* @__PURE__ */ jsxs("dd", { children: [
            /* @__PURE__ */ jsx("a", { href: "https://obsidian.md/", children: "Obsidian" }),
            ",",
            " ",
            /* @__PURE__ */ jsx("a", { href: "https://quartz.jzhao.xyz/", children: "Quartz" })
          ] })
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
