// src/components/Weeks.tsx
import { getDate, resolveRelative } from "@quartz-community/utils";

// src/components/styles/weeks.scss
var weeks_default = ".center:has(.weeks)>article h2,.center:has(.weeks)>article ul,.center:has(.weeks)>article ol{display:none}.weeks{--wk-h: 1.5rem;--era-0: color-mix(in srgb, var(--secondary) 24%, var(--light));--era-1: color-mix(in srgb, var(--tertiary) 24%, var(--light));--era-2: color-mix(in srgb, #3b6ea8 24%, var(--light));--era-3: color-mix(in srgb, #b8860b 26%, var(--light));--era-4: color-mix(in srgb, #8e4a7f 22%, var(--light));margin:.5rem 0 3rem}.weeks-count{margin:0 0 1rem;font-family:var(--codeFont);font-size:.8rem;color:var(--gray)}.weeks-eras{display:flex;flex-wrap:wrap;gap:.4rem 1.5rem;margin:0 0 1.5rem;padding:0;list-style:none;font-size:.875rem;color:var(--darkgray)}.weeks-eras li{display:flex;align-items:center;gap:.5rem}.weeks-eras .wk{height:.9rem;width:.9rem}.weeks-era-from{font-family:var(--codeFont);font-size:.75rem;color:var(--gray)}.weeks-grid{display:flex;flex-wrap:wrap;gap:4px}.wk{box-sizing:border-box;flex:0 0 auto;width:.95rem;height:var(--wk-h);border:1px solid var(--lightgray);border-radius:4px;background-color:var(--surface, transparent)}.wk.era-0{border-color:color-mix(in srgb, var(--gray) 35%, transparent);background-color:var(--era-0)}.wk.era-1{border-color:color-mix(in srgb, var(--gray) 35%, transparent);background-color:var(--era-1)}.wk.era-2{border-color:color-mix(in srgb, var(--gray) 35%, transparent);background-color:var(--era-2)}.wk.era-3{border-color:color-mix(in srgb, var(--gray) 35%, transparent);background-color:var(--era-3)}.wk.era-4{border-color:color-mix(in srgb, var(--gray) 35%, transparent);background-color:var(--era-4)}.wk.mark{width:auto;padding:0 .4rem;font-family:var(--codeFont);font-size:.7rem;line-height:calc(var(--wk-h) - 2px);color:var(--gray)}.wk.ev{width:auto;max-width:100%;padding:0 .55rem;border-color:color-mix(in srgb, var(--gray) 55%, transparent);font-size:.78rem;font-weight:500;line-height:calc(var(--wk-h) - 2px);color:var(--dark);text-decoration:none}.wk.ev span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wk.now{border-color:var(--secondary);box-shadow:0 0 0 2px color-mix(in srgb, var(--secondary) 30%, transparent)}a.wk.ev{transition:color .15s ease,border-color .15s ease}a.wk.ev:hover{color:var(--secondary);border-color:var(--secondary)}.weeks-list{margin-top:2.5rem;font-size:.95rem}.weeks-list summary{width:fit-content;font-family:var(--codeFont);font-size:.8rem;color:var(--gray);cursor:pointer}.weeks-list summary:hover{color:var(--secondary)}.weeks-list ol{margin:1rem 0 0;padding:0;list-style:none}.weeks-list li{display:grid;grid-template-columns:7.5rem minmax(0, 1fr);gap:1rem;padding:.35rem 0;line-height:1.5;color:var(--darkgray)}.weeks-list time{font-family:var(--codeFont);font-size:.8rem;line-height:1.9;color:var(--gray)}.weeks-list a{color:var(--secondary);text-decoration:underline;text-decoration-color:color-mix(in srgb, currentColor 35%, transparent);text-decoration-thickness:1px;text-underline-offset:.2em}.weeks-list a:hover{color:var(--tertiary)}";

// src/components/Weeks.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var defaultOptions = {
  slug: "weeks",
  born: "",
  postsFolder: "posts"
};
var WEEK = 7 * 24 * 60 * 60 * 1e3;
var ERA_COLOURS = 5;
var DATED = /^\s*(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?\s*[:–—-]?\s+(.+)$/s;
var text = (node) => node.type === "text" ? node.value ?? "" : (node.children ?? []).map(text).join("");
var firstLink = (node) => {
  if (node.tagName === "a") return node.properties?.href;
  for (const child of node.children ?? []) {
    const href = firstLink(child);
    if (href) return href;
  }
  return void 0;
};
function readNote(tree) {
  const events = [];
  const eras = [];
  let era;
  let pending;
  const walk = (node) => {
    if (node.tagName === "h2") {
      pending = text(node).trim();
      return;
    }
    if (node.tagName === "li") {
      const own = { ...node, children: (node.children ?? []).filter((c) => c.tagName !== "ul") };
      const match = DATED.exec(text(own));
      if (match) {
        const [, y, m, d, label] = match;
        const date = new Date(Date.UTC(Number(y), Number(m ?? 1) - 1, Number(d ?? 1)));
        if (pending !== void 0) {
          era = eras.push({ name: pending, from: date }) - 1;
          pending = void 0;
        }
        events.push({ date, label: label.trim(), href: firstLink(own), era });
      }
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(tree);
  return { events, eras };
}
var Weeks_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const postsPrefix = options.postsFolder ? `${options.postsFolder.replace(/\/$/, "")}/` : void 0;
  const Weeks = ({
    fileData,
    allFiles,
    tree,
    cfg,
    displayClass
  }) => {
    if (fileData.slug !== options.slug) return null;
    const locale = cfg.locale || "en-US";
    const { events, eras } = readNote(tree);
    if (postsPrefix) {
      const cfgDateType = cfg.defaultDateType;
      for (const f of allFiles) {
        const slug = f.slug;
        if (!slug || !slug.startsWith(postsPrefix) || slug.endsWith("/index")) continue;
        const data = { ...f, defaultDateType: f.defaultDateType ?? cfgDateType };
        const date = data.defaultDateType ? getDate(data) : void 0;
        if (!date) continue;
        events.push({
          date,
          label: `Wrote \u201C${f.frontmatter?.title ?? slug}\u201D`,
          href: resolveRelative(fileData.slug, slug)
        });
      }
    }
    if (events.length === 0 && !options.born) return null;
    events.sort((a, b) => a.date.getTime() - b.date.getTime());
    const born = options.born ? /* @__PURE__ */ new Date(`${options.born}T00:00:00Z`) : void 0;
    const start = born ?? events[0].date;
    const now = /* @__PURE__ */ new Date();
    const total = Math.max(1, Math.floor((now.getTime() - start.getTime()) / WEEK) + 1);
    const weekOf = (date) => Math.floor((date.getTime() - start.getTime()) / WEEK);
    const byWeek = /* @__PURE__ */ new Map();
    for (const event of events) {
      const week = weekOf(event.date);
      if (week < 0 || week >= total) continue;
      byWeek.set(week, [...byWeek.get(week) ?? [], event]);
    }
    const markers = /* @__PURE__ */ new Map();
    if (born) {
      for (let age = 1; ; age++) {
        const day2 = new Date(born);
        day2.setUTCFullYear(born.getUTCFullYear() + age);
        if (day2 > now) break;
        markers.set(weekOf(day2), String(age));
      }
    } else {
      for (let year = start.getUTCFullYear() + 1; year <= now.getUTCFullYear(); year++) {
        markers.set(weekOf(new Date(Date.UTC(year, 0, 1))), String(year));
      }
    }
    const eraAt = (week) => {
      let current;
      eras.forEach((era, i) => {
        if (weekOf(era.from) <= week) current = i;
      });
      return current;
    };
    const day = (date) => date.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    });
    const month = (date) => date.toLocaleDateString(locale, { month: "short", year: "numeric", timeZone: "UTC" });
    const cells = [];
    for (let week = 0; week < total; week++) {
      const era = eraAt(week);
      const eraClass = era === void 0 ? "" : ` era-${era % ERA_COLOURS}`;
      const first = new Date(start.getTime() + week * WEEK);
      const title = `Week of ${day(first)}${era === void 0 ? "" : ` \xB7 ${eras[era].name}`}`;
      const here = week === total - 1 ? " now" : "";
      const held = byWeek.get(week);
      if (held) {
        for (const event of held) {
          const label = /* @__PURE__ */ jsx("span", { children: event.label });
          cells.push(
            event.href ? /* @__PURE__ */ jsx("a", { class: `wk ev${eraClass}${here}`, href: event.href, title, children: label }) : /* @__PURE__ */ jsx("span", { class: `wk ev${eraClass}${here}`, title, children: label })
          );
        }
      } else if (markers.has(week)) {
        cells.push(
          /* @__PURE__ */ jsx("span", { class: `wk mark${eraClass}${here}`, title, "aria-hidden": "true", children: markers.get(week) })
        );
      } else {
        cells.push(/* @__PURE__ */ jsx("span", { class: `wk${eraClass}${here}`, title, "aria-hidden": "true" }));
      }
    }
    return /* @__PURE__ */ jsxs("section", { class: `weeks ${displayClass ?? ""}`, children: [
      /* @__PURE__ */ jsxs("p", { class: "weeks-count", children: [
        total.toLocaleString("en"),
        " weeks since ",
        month(start),
        events.length > 0 && ` \xB7 ${events.length} marked`
      ] }),
      eras.length > 0 && /* @__PURE__ */ jsx("ul", { class: "weeks-eras", children: eras.map((era, i) => /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("span", { class: `wk era-${i % ERA_COLOURS}`, "aria-hidden": "true" }),
        era.name,
        /* @__PURE__ */ jsxs("span", { class: "weeks-era-from", children: [
          "from ",
          month(era.from)
        ] })
      ] })) }),
      /* @__PURE__ */ jsx("div", { class: "weeks-grid", role: "group", "aria-label": "One box for each week, oldest first", children: cells }),
      events.length > 0 && /* @__PURE__ */ jsxs("details", { class: "weeks-list", children: [
        /* @__PURE__ */ jsx("summary", { children: "The same weeks as a list" }),
        /* @__PURE__ */ jsx("ol", { children: events.map((event) => /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("time", { datetime: event.date.toISOString().slice(0, 10), children: day(event.date) }),
          event.href ? /* @__PURE__ */ jsx("a", { href: event.href, children: event.label }) : /* @__PURE__ */ jsx("span", { children: event.label })
        ] })) })
      ] })
    ] });
  };
  Weeks.css = weeks_default;
  return Weeks;
});
export {
  Weeks_default as Weeks
};
