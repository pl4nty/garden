// Hand-authored compiled output (mirrors what tsup would emit). Quartz loads
// dist/ at runtime; keep it in sync with ../src when editing.

// preact jsx-runtime (inlined so the plugin doesn't depend on module resolution)
var l;
l = {
  __e: function (n2, l2, u3, t2) {
    for (var i2, r2, o2; (l2 = l2.__); )
      if ((i2 = l2.__c) && !i2.__)
        try {
          if (
            (r2 = i2.constructor) &&
            null != r2.getDerivedStateFromError &&
            (i2.setState(r2.getDerivedStateFromError(n2)), (o2 = i2.__d)),
            null != i2.componentDidCatch &&
              (i2.componentDidCatch(n2, t2 || {}), (o2 = i2.__d)),
            o2
          )
            return (i2.__E = i2);
        } catch (l3) {
          n2 = l3;
        }
    throw n2;
  },
};
var f2 = 0;
function u2(e2, t2, n2, o2, i2, u3) {
  t2 || (t2 = {});
  var a2,
    c2,
    p2 = t2;
  if ("ref" in p2) for (c2 in ((p2 = {}), t2)) "ref" == c2 ? (a2 = t2[c2]) : (p2[c2] = t2[c2]);
  var l2 = {
    type: e2,
    props: p2,
    key: n2,
    ref: a2,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __c: null,
    constructor: void 0,
    __v: --f2,
    __i: -1,
    __u: 0,
    __source: i2,
    __self: u3,
  };
  if ("function" == typeof e2 && (a2 = e2.defaultProps))
    for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l.vnode && l.vnode(l2), l2;
}

// src/components/styles/socials.scss
var socials_default =
  ".socials {\n  display: flex;\n  flex-direction: row;\n  flex-wrap: wrap;\n  gap: 0.9rem;\n  align-items: center;\n  margin-top: 0.6rem;\n}\n.socials .social-link {\n  color: var(--darkgray);\n  background: none;\n  padding: 0;\n  display: inline-flex;\n  align-items: center;\n  opacity: 0.8;\n  transition: color 0.2s ease, opacity 0.2s ease;\n}\n.socials .social-link:hover {\n  color: var(--secondary);\n  opacity: 1;\n}\n.socials .social-icon {\n  display: inline-flex;\n}\n.socials .social-icon svg {\n  width: 1.3rem;\n  height: 1.3rem;\n  display: block;\n}";

// src/components/Socials.tsx
var icons = {
  github:
    '<svg role="img" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
  linkedin:
    '<svg role="img" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  homelab:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>',
  status:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
};
var Socials_default = (opts) => {
  const Socials = ({ displayClass }) => {
    const links = opts?.links ?? {};
    return u2("div", {
      class: `socials ${displayClass ?? ""}`,
      children: Object.entries(links).map(([label, url]) => {
        const icon = icons[label.toLowerCase()];
        return u2("a", {
          href: url,
          class: "social-link",
          "aria-label": label,
          title: label,
          target: "_blank",
          rel: "noopener noreferrer",
          children: icon
            ? u2("span", { class: "social-icon", dangerouslySetInnerHTML: { __html: icon } })
            : label,
        });
      }),
    });
  };
  Socials.css = socials_default;
  return Socials;
};

export { Socials_default as Socials };
