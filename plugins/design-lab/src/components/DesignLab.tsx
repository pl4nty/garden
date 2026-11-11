import type { QuartzComponent, QuartzComponentConstructor } from "@quartz-community/types"

// PREVIEW ONLY. A panel that switches between design variants, so that they
// can be compared on real pages. Each choice sets a `data-*` attribute on the
// root element, which quartz/styles/lab.scss styles, and is kept in
// localStorage. Remove this plugin and lab.scss when the design is settled.
const groups: { key: string; label: string; options: [string, string][] }[] = [
  {
    key: "paper",
    label: "Paper (light mode)",
    options: [
      ["greenbar", "Greenbar: tinted paper, green ink"],
      ["white", "White paper, green ink"],
      ["grey", "White paper, grey ink, green links"],
    ],
  },
  {
    key: "night",
    label: "Night (dark mode)",
    options: [
      ["ink", "Ink black"],
      ["paper", "Night paper: a shade lighter"],
      ["warm", "Warm black, cream ink"],
      ["forest", "Forest green"],
    ],
  },
  {
    key: "type",
    label: "Typeface",
    options: [
      ["serif", "Vollkorn"],
      ["sans", "Titillium Web"],
    ],
  },
  {
    key: "layout",
    label: "Layout",
    options: [
      ["book", "Book"],
      ["plain", "Plain"],
    ],
  },
]

const keys = JSON.stringify(groups.map((g) => g.key))

// Before first paint: put the stored choices on the root element.
const apply = `
(() => {
  for (const key of ${keys}) {
    try {
      const value = localStorage.getItem("lab-" + key)
      if (value) document.documentElement.dataset[key] = value
    } catch (e) {}
  }
})();
`

// After load, and after each SPA navigation: make the panel show the choices.
const wire = `
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
`

export default (() => {
  const DesignLab: QuartzComponent = () => (
    <details class="design-lab">
      <summary>Design lab</summary>
      <form>
        {groups.map((group) => (
          <fieldset>
            <legend>{group.label}</legend>
            {group.options.map(([value, label], i) => (
              <label>
                <input type="radio" name={`lab-${group.key}`} value={value} checked={i === 0} />
                {label}
              </label>
            ))}
          </fieldset>
        ))}
        <button type="button" class="design-lab-reset">
          Reset
        </button>
        <p>Preview only. Use the theme switch for light and dark.</p>
      </form>
    </details>
  )

  DesignLab.beforeDOMLoaded = apply
  DesignLab.afterDOMLoaded = wire
  return DesignLab
}) satisfies QuartzComponentConstructor
