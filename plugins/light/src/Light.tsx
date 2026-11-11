import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { DAY, NIGHT, PAGE, cssVars, declarations } from "./palettes"
// @ts-expect-error - bundled to a string of browser JavaScript by plugins/build.mjs
import script from "./light.inline.ts"
import style from "./light.scss"

// The switch for the light: follow the clock, day, or night. It replaces
// Quartz's two-state theme toggle; light.inline.ts does the work and sets the
// same `saved-theme` attribute and `themechange` event the rest of Quartz uses.
export default (() => {
  const Light: QuartzComponent = ({ displayClass }: QuartzComponentProps) => (
    <button
      type="button"
      class={`light-switch ${displayClass ?? ""}`}
      data-light-switch
      aria-label="Light"
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        {/* auto: the sun on the horizon */}
        <g class="light-auto">
          <path d="M1.5 11.5h13M4.6 11.5a3.4 3.4 0 0 1 6.8 0M8 3.2v1.6M2.9 5.9l1.1 1.1M13.1 5.9 12 7" />
        </g>
        <g class="light-day">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1.6v1.6M8 12.8v1.6M1.6 8h1.6M12.8 8h1.6M3.5 3.5l1.1 1.1M11.4 11.4l1.1 1.1M3.5 12.5l1.1-1.1M11.4 4.6l1.1-1.1" />
        </g>
        <g class="light-night">
          <path d="M12.9 9.8A5.4 5.4 0 0 1 6.2 3.1a5.4 5.4 0 1 0 6.7 6.7z" />
        </g>
      </svg>
      <span data-light-label>Auto</span>
    </button>
  )

  // The day and night states of the scene. Day is the default, and what a
  // browser with scripting off shows; with scripting off and a system that
  // asks for dark, the night state and the dark page colours apply.
  const dayVars = declarations(cssVars(DAY, false))
  const nightVars = declarations(cssVars(NIGHT, true))
  Light.css =
    `:root{${dayVars};--page:${PAGE.light}}` +
    `:root[saved-theme="dark"]{${nightVars};--page:${PAGE.dark}}` +
    `@media (scripting:none) and (prefers-color-scheme:dark){:root{${nightVars};--page:${PAGE.dark}}}` +
    style
  Light.beforeDOMLoaded = script
  return Light
}) satisfies QuartzComponentConstructor
