// Sets the light of the site, in the browser, before the page paints.
//
// The visitor's choice is one of three, kept in localStorage under "theme"
// (the key Quartz's own theme switch uses):
//
//   (nothing)  follow the visitor's clock: the scene takes the light of the
//              hour, and the page is dark from dusk to dawn. A system that
//              asks for dark gets night at any hour.
//   "light"    midday, always
//   "dark"     night, always
//
// `?t=17.5` in the address overrides the clock (and the choice), to look at an
// hour of the day. A browser driven by a test or screenshot tool
// (`navigator.webdriver`) does not follow the clock unless the address says
// so: it gets midday, or night if it asks for dark, so that its pictures are
// the same at any hour.
import { cssVars, isDark, lightAt, nameOf } from "./palettes"

type Mode = "auto" | "light" | "dark"
type Theme = "light" | "dark"
const ORDER: Mode[] = ["auto", "light", "dark"]
const root = document.documentElement
let applied: string[] = []

const mode = (): Mode => {
  const stored = localStorage.getItem("theme")
  return stored === "light" || stored === "dark" ? stored : "auto"
}

const override = () => {
  const t = new URLSearchParams(location.search).get("t")
  return t !== null && t !== "" && !isNaN(Number(t)) ? Number(t) : undefined
}

const clock = () => {
  const now = new Date()
  return now.getHours() + now.getMinutes() / 60
}

// "4:07 pm"
const say = (hour: number) => {
  const h = Math.floor(hour) % 24
  const m = Math.floor((hour % 1) * 60 + 1e-6)
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`
}

function apply() {
  const forced = override()
  const m = forced === undefined ? mode() : "auto"
  const systemDark = forced === undefined && matchMedia("(prefers-color-scheme: dark)").matches
  const hour = forced ?? clock()
  const driven = forced === undefined && navigator.webdriver
  const follow = m === "auto" && !systemDark && !driven
  const theme: Theme = follow
    ? isDark(hour)
      ? "dark"
      : "light"
    : m === "light" || (m === "auto" && !systemDark)
      ? "light"
      : "dark"

  for (const name of applied) root.style.removeProperty(name)
  applied = []
  if (follow) {
    const vars = cssVars(lightAt(hour), theme === "dark")
    for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value)
    applied = Object.keys(vars)
  }

  const before = root.getAttribute("saved-theme")
  root.setAttribute("saved-theme", theme)
  root.dataset.light = m
  if (document.body) {
    document.body.classList.remove("theme-dark", "theme-light")
    document.body.classList.add(`theme-${theme}`)
  }
  // the comments and the graph repaint on this event
  if (before !== null && before !== theme) {
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }))
  }

  // the name of the light is only true of the clock when the light follows it
  const name = follow ? nameOf(hour) : ""
  for (const el of document.querySelectorAll("[data-light-name]")) el.textContent = name
  for (const el of document.querySelectorAll("[data-light-clock]")) el.textContent = say(hour)
  for (const el of document.querySelectorAll<HTMLElement>("[data-light-switch]")) {
    const label = m === "auto" ? "Auto" : m === "light" ? "Day" : "Night"
    const next = ORDER[(ORDER.indexOf(m) + 1) % ORDER.length]!
    const nextLabel = next === "auto" ? "your local time" : next === "light" ? "day" : "night"
    el.dataset.mode = m
    const text = el.querySelector("[data-light-label]")
    if (text) text.textContent = label
    const now = follow
      ? "follows your local time"
      : m === "auto"
        ? `automatic, which is ${theme === "dark" ? "night while your system asks for dark" : "day"}`
        : label.toLowerCase()
    el.setAttribute("aria-label", `Light: ${now}. Switch to ${nextLabel}.`)
    el.title = `Light: ${now}`
  }
}

apply()

const step = () => {
  const next = ORDER[(ORDER.indexOf(mode()) + 1) % ORDER.length]!
  if (next === "auto") localStorage.removeItem("theme")
  else localStorage.setItem("theme", next)
  apply()
}

document.addEventListener("nav", () => {
  apply()
  for (const el of document.querySelectorAll("[data-light-switch]")) {
    el.addEventListener("click", step)
    window.addCleanup(() => el.removeEventListener("click", step))
  }
})

// The light moves with the clock while the page stays open.
setInterval(apply, 60_000)
document.addEventListener("visibilitychange", () => document.hidden || apply())
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", apply)
