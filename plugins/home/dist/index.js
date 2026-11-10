// src/components/Home.tsx
import { getDate, resolveRelative } from "@quartz-community/utils";

// src/components/vine.ts
var vine = '<svg viewBox="0 0 340 500" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect class="p" style="--d:0s" x="103" y="470" width="14" height="26" rx="3"/><rect class="p" style="--d:0.05s" x="133" y="470" width="14" height="26" rx="3"/><rect class="p" style="--d:0.1s" x="163" y="470" width="14" height="26" rx="3"/><rect class="p" style="--d:0.15000000000000002s" x="193" y="470" width="14" height="26" rx="3"/><rect class="p" style="--d:0.2s" x="223" y="470" width="14" height="26" rx="3"/><g stroke-width="2.25"><path class="t" style="--d:0.1s" pathLength="1" d="M170 470L170 410L145 385L145 315L180 280L180 200L160 180L160 120"/><path class="t" style="--d:0.6s" pathLength="1" d="M145 350L121 326L91 326"/><path class="t" style="--d:0.8s" pathLength="1" d="M163 297L207 297"/><path class="t" style="--d:0.95s" pathLength="1" d="M180 262L206 236L246 236"/><path class="t" style="--d:1.05s" pathLength="1" d="M180 240L150 210L116 210"/><path class="t" style="--d:1.2s" pathLength="1" d="M180 200L204 176L204 148L220 132"/><path class="t" style="--d:1.4s" pathLength="1" d="M160 150L136 126L136 108"/><path class="t" style="--d:0.2s" pathLength="1" d="M110 470L110 446L76 412L76 385"/><path class="t" style="--d:0.15s" pathLength="1" d="M140 470L140 430L124 414L124 396"/><path class="t" style="--d:0.15s" pathLength="1" d="M200 470L200 436L218 418L218 388"/><path class="t" style="--d:0.25s" pathLength="1" d="M230 470L230 450L268 412L268 378"/></g><g stroke-width="1.75"><g class="l" style="--d:1.5s"><path class="f" d="M160 120Q179.7 93.9 160 62Q140.3 93.9 160 120Z"/><path class="r" d="M160 120L160 84"/></g><g class="l" style="--d:0.95s"><path class="f" d="M91 326Q77 302.8 46.4 308.2Q64.9 333.1 91 326Z"/><path class="r" d="M91 326L63.4 314.9"/></g><g class="l" style="--d:1.2999999999999998s"><path class="f" d="M246 236Q273.5 246.2 295.8 221.1Q263.3 212.3 246 236Z"/><path class="r" d="M246 236L276.9 226.7"/></g><g class="l" style="--d:1.4s"><path class="f" d="M116 210Q103 186.3 72.2 190.3Q89.6 216 116 210Z"/><path class="r" d="M116 210L88.9 197.8"/></g><g class="l" style="--d:1.5499999999999998s"><path class="f" d="M220 132Q244.1 125.9 247.5 97.6Q220.7 107.2 220 132Z"/><path class="r" d="M220 132L237 110.7"/></g><g class="l" style="--d:1.75s"><path class="f" d="M136 108Q140.1 85.8 118.1 72.2Q115.8 98 136 108Z"/><path class="r" d="M136 108L124.9 85.8"/></g><g class="l" style="--d:0.8s"><path class="f" d="M76 385Q78.4 362.6 55.4 350.7Q55.1 376.6 76 385Z"/><path class="r" d="M76 385L63.2 363.7"/></g><g class="l" style="--d:0.85s"><path class="f" d="M268 378Q290.5 370.7 292.1 343.6Q267.1 354.3 268 378Z"/><path class="r" d="M268 378L282.9 356.7"/></g></g><g stroke-width="2.25"><circle class="v" style="--d:0.7s" cx="145" cy="315" r="4"/><circle class="v" style="--d:0.6s" cx="145" cy="350" r="4"/><circle class="v" style="--d:0.8s" cx="163" cy="297" r="4"/><circle class="v" style="--d:1.1s" cx="207" cy="297" r="5.5"/><circle class="v" style="--d:0.95s" cx="180" cy="262" r="4"/><circle class="v" style="--d:1.05s" cx="180" cy="240" r="4"/><circle class="v" style="--d:1.2s" cx="180" cy="200" r="4"/><circle class="v" style="--d:1.4s" cx="160" cy="150" r="4"/><circle class="v" style="--d:0.65s" cx="124" cy="396" r="5.5"/><circle class="v" style="--d:0.65s" cx="218" cy="388" r="5.5"/></g></svg>';

// src/components/styles/home.scss
var home_default = '.home-hero{position:relative;padding-top:clamp(2rem,7vw,5.5rem)}.home-eyebrow{margin:0 0 1.25rem;font-family:var(--codeFont);font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--gray)}.home-heading{max-width:14em;margin:0;font-family:var(--headerFont);font-size:clamp(2.4rem,1.2rem + 4.6vw,4.25rem);font-weight:500;line-height:1.04;letter-spacing:-0.022em;text-wrap:balance;color:var(--dark)}.home-heading em{font-style:italic;font-weight:400;color:var(--secondary)}.home-art{position:absolute;top:1.5rem;right:-1rem;width:21rem;pointer-events:none;color:var(--secondary)}.home-art svg{display:block;width:100%;height:auto;overflow:visible}@media(max-width: 1100px){.home-art{display:none}}.home-art .t{stroke-dasharray:1;animation:home-vine-draw .7s ease-out both;animation-delay:var(--d)}.home-art .l,.home-art .v,.home-art .p{animation:home-vine-show .5s ease-out both;animation-delay:var(--d)}.home-art .l{transform-box:fill-box;transform-origin:center}.home-art .f{fill:currentColor;fill-opacity:.13}.home-art .r{stroke-width:1.25;opacity:.7}.home-art .v{fill:var(--light)}.home-art .p{fill:currentColor;fill-opacity:.18;stroke-width:1.5}@keyframes home-vine-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}@keyframes home-vine-show{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}@media(prefers-reduced-motion: reduce){.home-art .t,.home-art .l,.home-art .v,.home-art .p{animation:none}}.home-contact{display:grid;grid-template-columns:max-content max-content;gap:.15rem 0;margin:0;font-family:var(--codeFont);font-size:.85rem;line-height:1.6}.home-contact>div{display:contents}.home-contact dt{color:var(--gray)}.home-contact dd{margin:0}.home-contact dd::before{content:"\u2192";margin:0 .9em;color:var(--gray)}.home-contact a{color:var(--secondary);background-color:rgba(0,0,0,0);text-decoration:underline;text-decoration-color:color-mix(in srgb, currentColor 35%, transparent);text-decoration-thickness:1px;text-underline-offset:.2em}.home-contact a:hover{color:var(--tertiary);text-decoration-color:currentColor}.home-columns{display:grid;grid-template-columns:minmax(0, 7fr) minmax(0, 5fr);gap:3.5rem;margin-top:clamp(3rem,7vw,5rem)}@media(max-width: 900px){.home-columns{grid-template-columns:minmax(0, 1fr);gap:3rem}}.home-section>header{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;padding-bottom:.7rem;border-bottom:1px solid var(--lightgray)}.home-section>header h2{margin:0;font-family:var(--codeFont);font-size:.8rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--gray)}.home-section>header a{font-family:var(--codeFont);font-size:.8rem;font-weight:500;white-space:nowrap;color:var(--secondary);background-color:rgba(0,0,0,0)}.home-section>header a:hover{color:var(--tertiary)}.home-section ol,.home-section ul{margin:0;padding:0;list-style:none}.home-writing li+li{border-top:1px solid var(--lightgray)}.home-writing .home-card{display:grid;grid-template-columns:3.25rem minmax(0, 1fr);column-gap:1rem;padding:1.35rem 0;background-color:rgba(0,0,0,0)}.home-writing .home-card time{grid-row:1/span 2;padding-top:.42rem;font-family:var(--codeFont);font-size:.8rem;font-weight:400;color:var(--gray)}.home-writing .home-card h3{margin:0;font-family:var(--headerFont);font-size:1.5rem;font-weight:500;line-height:1.2;letter-spacing:-0.012em;text-wrap:balance;color:var(--dark);transition:color .15s ease}.home-writing .home-card p{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;line-clamp:2;overflow:hidden;margin:.45rem 0 0;font-size:.95rem;font-weight:400;line-height:1.5;color:var(--darkgray)}.home-writing .home-card:hover h3{color:var(--secondary)}.home-tended li+li{border-top:1px solid var(--lightgray)}.home-tended li>a{display:block;padding:.8rem 0;background-color:rgba(0,0,0,0)}.home-tended li>a:hover .home-note-title{color:var(--secondary)}.home-tended .home-note-title{display:block;font-size:1rem;font-weight:500;line-height:1.35;color:var(--dark);transition:color .15s ease}.home-tended .home-note-meta{display:flex;justify-content:space-between;gap:1rem;margin-top:.2rem;font-family:var(--codeFont);font-size:.75rem;font-weight:400;line-height:1.4;color:var(--gray)}.home-tended .home-note-meta time{white-space:nowrap}.home-topics{margin-top:clamp(3rem,7vw,5rem)}.home-index{display:grid;grid-template-columns:repeat(auto-fit, minmax(11rem, 1fr));gap:2rem 2.5rem;margin-top:1.5rem}.home-index h3{display:flex;align-items:baseline;gap:.6rem;margin:0 0 .6rem;font-family:var(--headerFont);font-size:1.4rem;font-weight:500;line-height:1.2}.home-index h3 a{color:var(--dark);background-color:rgba(0,0,0,0)}.home-index h3 a:hover{color:var(--secondary)}.home-index h3 span{font-family:var(--codeFont);font-size:.75rem;font-weight:400;color:var(--gray)}.home-index li a{display:block;padding:.2rem 0;font-size:.95rem;font-weight:400;line-height:1.4;color:var(--darkgray);background-color:rgba(0,0,0,0)}.home-index li a:hover{color:var(--secondary)}.home-index li a span{margin-left:.1em;color:var(--gray)}';

// src/components/Home.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var defaultOptions = {
  section: "sections",
  eyebrow: "",
  heading: "",
  links: {},
  featured: [],
  postsFolder: "posts",
  notesFolder: "notes",
  recentCount: 6
};
var isIndex = (slug) => slug === "index" || slug.endsWith("/index");
var folderNames = (f) => (f.relativePath ?? "").split("/").slice(0, -1);
function emphasise(text) {
  return text.split("*").map((part, i) => i % 2 === 1 ? /* @__PURE__ */ jsx("em", { children: part }) : part);
}
var Home_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const postsPrefix = `${options.postsFolder.replace(/\/$/, "")}/`;
  const notesPrefix = `${options.notesFolder.replace(/\/$/, "")}/`;
  const Home = ({
    fileData,
    allFiles,
    cfg,
    displayClass
  }) => {
    if (fileData.slug !== "index") return null;
    if (options.section === "hero") {
      return /* @__PURE__ */ jsxs("header", { class: `home-hero ${displayClass ?? ""}`, children: [
        /* @__PURE__ */ jsx("div", { class: "home-art", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: vine } }),
        options.eyebrow && /* @__PURE__ */ jsx("p", { class: "home-eyebrow", children: options.eyebrow }),
        /* @__PURE__ */ jsx("h1", { class: "home-heading", children: emphasise(options.heading || fileData.frontmatter?.title || "") })
      ] });
    }
    const locale = cfg.locale || "en-US";
    const cfgDateType = cfg.defaultDateType;
    const dateOf = (f) => {
      const data = {
        ...f,
        defaultDateType: f.defaultDateType ?? cfgDateType
      };
      return data.defaultDateType ? getDate(data) : void 0;
    };
    const href = (slug) => resolveRelative(fileData.slug, slug);
    const title = (f) => f.frontmatter?.title ?? f.slug;
    const shortDate = (d) => d.toLocaleDateString(locale, { month: "short", year: "numeric" });
    const pages = allFiles.filter((f) => f.slug && !isIndex(f.slug));
    const posts = pages.filter((f) => f.slug.startsWith(postsPrefix));
    const notes = pages.filter((f) => f.slug.startsWith(notesPrefix));
    const bySlug = new Map(allFiles.map((f) => [f.slug, f]));
    const featured = options.featured.map((slug) => bySlug.get(slug)).filter((f) => Boolean(f));
    const recent = notes.map((f) => ({ f, date: dateOf(f) })).filter((n) => Boolean(n.date)).sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, options.recentCount);
    const topics = /* @__PURE__ */ new Map();
    for (const f of notes) {
      const segments = f.slug.split("/");
      const names = folderNames(f);
      if (segments.length < 3 || names.length < 2) continue;
      const key = segments[1];
      const topic = topics.get(key) ?? {
        name: names[1],
        count: 0,
        children: /* @__PURE__ */ new Map()
      };
      topic.count++;
      if (names[2]) {
        topic.children.set(names[2], {
          slug: `${segments.slice(0, 3).join("/")}/index`,
          folder: true
        });
      } else {
        topic.children.set(title(f), { slug: f.slug, folder: false });
      }
      topics.set(key, topic);
    }
    const bare = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    const links = Object.entries(options.links);
    return /* @__PURE__ */ jsxs("div", { class: `home-sections ${displayClass ?? ""}`, children: [
      links.length > 0 && /* @__PURE__ */ jsx("dl", { class: "home-contact", children: links.map(([label, url]) => {
        const external = /^https?:\/\//.test(url);
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { children: label.toLowerCase() }),
          /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx(
            "a",
            {
              href: url,
              target: external ? "_blank" : void 0,
              rel: external ? "noopener noreferrer" : void 0,
              children: bare(url)
            }
          ) })
        ] });
      }) }),
      /* @__PURE__ */ jsxs("div", { class: "home-columns", children: [
        featured.length > 0 && /* @__PURE__ */ jsxs("section", { class: "home-section home-writing", children: [
          /* @__PURE__ */ jsxs("header", { children: [
            /* @__PURE__ */ jsx("h2", { children: "Writing" }),
            /* @__PURE__ */ jsxs("a", { href: href(`${postsPrefix}index`), children: [
              "All ",
              posts.length,
              " posts \u2192"
            ] })
          ] }),
          /* @__PURE__ */ jsx("ol", { children: featured.map((f) => {
            const date = dateOf(f);
            return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: href(f.slug), class: "home-card", children: [
              date && /* @__PURE__ */ jsx("time", { datetime: date.toISOString(), children: String(date.getFullYear()) }),
              /* @__PURE__ */ jsx("h3", { children: title(f) }),
              f.description && /* @__PURE__ */ jsx("p", { children: f.description })
            ] }) });
          }) })
        ] }),
        recent.length > 0 && /* @__PURE__ */ jsxs("section", { class: "home-section home-tended", children: [
          /* @__PURE__ */ jsxs("header", { children: [
            /* @__PURE__ */ jsx("h2", { children: "Recently tended" }),
            /* @__PURE__ */ jsxs("a", { href: href(`${notesPrefix}index`), children: [
              "All ",
              notes.length,
              " notes \u2192"
            ] })
          ] }),
          /* @__PURE__ */ jsx("ul", { children: recent.map(({ f, date }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: href(f.slug), children: [
            /* @__PURE__ */ jsx("span", { class: "home-note-title", children: title(f) }),
            /* @__PURE__ */ jsxs("span", { class: "home-note-meta", children: [
              /* @__PURE__ */ jsx("span", { children: folderNames(f).slice(1).join(" / ") }),
              /* @__PURE__ */ jsx("time", { datetime: date.toISOString(), children: shortDate(date) })
            ] })
          ] }) })) })
        ] })
      ] }),
      topics.size > 0 && /* @__PURE__ */ jsxs("section", { class: "home-section home-topics", children: [
        /* @__PURE__ */ jsx("header", { children: /* @__PURE__ */ jsx("h2", { children: "Explore the notes" }) }),
        /* @__PURE__ */ jsx("div", { class: "home-index", children: [...topics.entries()].sort(([, a], [, b]) => b.count - a.count).map(([key, topic]) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h3", { children: [
            /* @__PURE__ */ jsx("a", { href: href(`${notesPrefix}${key}/index`), children: topic.name }),
            /* @__PURE__ */ jsx("span", { children: topic.count })
          ] }),
          /* @__PURE__ */ jsx("ul", { children: [...topic.children.entries()].sort(
            ([a, x], [b, y]) => Number(y.folder) - Number(x.folder) || a.localeCompare(b)
          ).map(([name, child]) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: href(child.slug), children: [
            name,
            child.folder && /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "/" })
          ] }) })) })
        ] })) })
      ] })
    ] });
  };
  Home.css = home_default;
  return Home;
});
export {
  Home_default as Home
};
