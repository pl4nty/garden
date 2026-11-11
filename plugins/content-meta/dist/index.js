// ../shared/listing.tsx
import { getDate } from "@quartz-community/utils";
import { jsx, jsxs } from "preact/jsx-runtime";
var isoDate = (d) => d.toISOString().slice(0, 10);
var wordCount = (f) => (f.text ?? "").split(/\s+/).filter(Boolean).length;
function humanSize(n) {
  if (n < 1e3) return String(n);
  const k = n / 1e3;
  return k < 9.95 ? `${k.toFixed(1)}k` : `${Math.round(k)}k`;
}
function dateOf(f, cfg) {
  const fallback = cfg.defaultDateType;
  const data = { ...f, defaultDateType: f.defaultDateType ?? fallback };
  return data.defaultDateType ? getDate(data) : void 0;
}

// src/components/styles/contentMeta.scss
var contentMeta_default = ".content-meta{display:flex;flex-wrap:wrap;gap:0 2ch;margin:0}";

// src/components/ContentMeta.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "preact/jsx-runtime";
var defaultOptions = {
  showReadingTime: true,
  historyUrl: "https://github.com/pl4nty/garden/commits/main/"
};
var ContentMeta_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const ContentMeta = ({ cfg, fileData, displayClass }) => {
    if (!fileData.text) return null;
    const date = dateOf(fileData, cfg);
    const words = wordCount(fileData);
    return /* @__PURE__ */ jsxs2("p", { class: `content-meta ${displayClass ?? ""}`, children: [
      date && /* @__PURE__ */ jsx2("time", { datetime: date.toISOString(), children: isoDate(date) }),
      /* @__PURE__ */ jsxs2("span", { children: [
        humanSize(words),
        " words"
      ] }),
      options.showReadingTime && /* @__PURE__ */ jsxs2("span", { children: [
        Math.max(1, Math.ceil(words / 200)),
        " min read"
      ] }),
      options.historyUrl && fileData.filePath && /* @__PURE__ */ jsx2(
        "a",
        {
          href: `${options.historyUrl}${fileData.filePath}`,
          target: "_blank",
          rel: "noopener noreferrer",
          children: "history"
        }
      )
    ] });
  };
  ContentMeta.css = contentMeta_default;
  return ContentMeta;
});
export {
  ContentMeta_default as ContentMeta
};
