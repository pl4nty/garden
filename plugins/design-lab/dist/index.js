// src/components/DesignLab.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var groups = [
  {
    key: "paper",
    label: "Paper (light mode)",
    options: [
      ["greenbar", "Greenbar: tinted paper, green ink"],
      ["white", "White paper, green ink"],
      ["grey", "White paper, grey ink, green links"]
    ]
  },
  {
    key: "night",
    label: "Night (dark mode)",
    options: [
      ["ink", "Ink black"],
      ["paper", "Night paper: a shade lighter"],
      ["warm", "Warm black, cream ink"],
      ["forest", "Forest green"]
    ]
  },
  {
    key: "type",
    label: "Typeface",
    options: [
      ["serif", "Vollkorn"],
      ["sans", "Titillium Web"]
    ]
  },
  {
    key: "layout",
    label: "Layout",
    options: [
      ["book", "Book"],
      ["plain", "Plain"]
    ]
  }
];
var keys = JSON.stringify(groups.map((g) => g.key));
var apply = `
(() => {
  for (const key of ${keys}) {
    try {
      const value = localStorage.getItem("lab-" + key)
      if (value) document.documentElement.dataset[key] = value
    } catch (e) {}
  }
})();
`;
var wire = `
(() => {
  const keys = ${keys}
  const sync = () => {
    const panel = document.querySelector(".design-lab")
    if (!panel) return
    for (const key of keys) {
      const value = document.documentElement.dataset[key]
      const input =
        (value && panel.querySelector('input[name="lab-' + key + '"][value="' + value + '"]')) ||
        panel.querySelector('input[name="lab-' + key + '"]')
      if (input) input.checked = true
    }
    try {
      panel.open = sessionStorage.getItem("lab-open") === "1"
    } catch (e) {}
  }
  document.addEventListener("change", (e) => {
    const input = e.target
    if (!input.name || !input.name.startsWith("lab-")) return
    const key = input.name.slice(4)
    document.documentElement.dataset[key] = input.value
    try {
      localStorage.setItem(input.name, input.value)
    } catch (e) {}
  })
  document.addEventListener(
    "toggle",
    (e) => {
      if (!e.target.classList || !e.target.classList.contains("design-lab")) return
      try {
        sessionStorage.setItem("lab-open", e.target.open ? "1" : "0")
      } catch (e) {}
    },
    true,
  )
  document.addEventListener("click", (e) => {
    if (!e.target.closest || !e.target.closest(".design-lab-reset")) return
    for (const key of keys) {
      delete document.documentElement.dataset[key]
      try {
        localStorage.removeItem("lab-" + key)
      } catch (e) {}
    }
    sync()
  })
  document.addEventListener("nav", sync)
  sync()
})();
`;
var DesignLab_default = (() => {
  const DesignLab = () => /* @__PURE__ */ jsxs("details", { class: "design-lab", children: [
    /* @__PURE__ */ jsx("summary", { children: "Design lab" }),
    /* @__PURE__ */ jsxs("form", { children: [
      groups.map((group) => /* @__PURE__ */ jsxs("fieldset", { children: [
        /* @__PURE__ */ jsx("legend", { children: group.label }),
        group.options.map(([value, label], i) => /* @__PURE__ */ jsxs("label", { children: [
          /* @__PURE__ */ jsx("input", { type: "radio", name: `lab-${group.key}`, value, checked: i === 0 }),
          label
        ] }))
      ] })),
      /* @__PURE__ */ jsx("button", { type: "button", class: "design-lab-reset", children: "Reset" }),
      /* @__PURE__ */ jsx("p", { children: "Preview only. Use the theme switch for light and dark." })
    ] })
  ] });
  DesignLab.beforeDOMLoaded = apply;
  DesignLab.afterDOMLoaded = wire;
  return DesignLab;
});
export {
  DesignLab_default as DesignLab
};
