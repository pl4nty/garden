// The light of the garden at each time of day. This file is the one source of
// the site's scene colours: the stylesheet takes its day and night states from
// here at build time, and the browser script (light.inline.ts) interpolates
// between the states for the visitor's local time.
//
// The garden looks north, as a garden in Melbourne does to face the sun: the
// sun rises on the right, crosses the top of the picture and sets on the left.
// Shadows therefore fall left in the morning, toward the viewer at midday and
// right in the evening.

export interface Light {
  // sky, from the top of the picture down to the horizon
  sky1: string
  sky2: string
  // ground, from the horizon toward the viewer
  ground1: string
  ground2: string
  // the glow of the sun or moon in the sky: colour, strength, position in %
  sun: string
  sunA: number
  sunX: number
  sunY: number
  // the pool of light that glow throws on the ground
  pool: string
  poolA: number
  poolX: number
  // the darkening toward the corners
  shade: string
  shadeA: number
  // leaf greens from light to deep, then stems and flowers
  g1: string
  g2: string
  g3: string
  g4: string
  stem: string
  wood: string
  straw: string
  p1: string
  p2: string
  p3: string
  yolk: string
  // cast shadows: colour, strength, and the skew that lays a plant's shape on
  // the ground (x per unit of height, and length as a share of height)
  sh: string
  shA: number
  shx: number
  shy: number
  // text set on the sky, and the halo that keeps it legible
  hud: string
  halo: string
  stars: number
}

const day: Light = {
  sky1: "#b9d0d9",
  sky2: "#edf0e4",
  ground1: "#e3e6d3",
  ground2: "#cfd6b8",
  sun: "#ffffff",
  sunA: 0.65,
  sunX: 50,
  sunY: 2,
  pool: "#fffbe0",
  poolA: 0.7,
  poolX: 52,
  shade: "#6f8478",
  shadeA: 0.1,
  g1: "#a6c07c",
  g2: "#76a563",
  g3: "#3b8440",
  g4: "#2a6a3c",
  stem: "#4f7d47",
  wood: "#6b5a45",
  straw: "#c8b572",
  p1: "#fbf8ec",
  p2: "#a99bd0",
  p3: "#ecd98a",
  yolk: "#dfae36",
  sh: "#34504a",
  shA: 0.28,
  shx: -0.4,
  shy: -0.24,
  hud: "#25332b",
  halo: "#edf0e4",
  stars: 0,
}

const night: Light = {
  sky1: "#060a13",
  sky2: "#101a2b",
  ground1: "#121c2b",
  ground2: "#0d151f",
  sun: "#a9bfe0",
  sunA: 0.16,
  sunX: 72,
  sunY: 14,
  pool: "#7f9cc4",
  poolA: 0.1,
  poolX: 60,
  shade: "#04070c",
  shadeA: 0.5,
  g1: "#c4d6c6",
  g2: "#9cbcab",
  g3: "#74a08d",
  g4: "#557f70",
  stem: "#6e9483",
  wood: "#7b8a86",
  straw: "#c0bf9f",
  p1: "#f3f5ee",
  p2: "#bdb8e8",
  p3: "#e9e2b4",
  yolk: "#dccd8c",
  sh: "#000000",
  shA: 0.38,
  shx: -0.45,
  shy: -0.2,
  hud: "#c5d0d6",
  halo: "#060a13",
  stars: 1,
}

const dawn: Light = {
  ...day,
  sky1: "#aebbd6",
  sky2: "#f1d6cf",
  ground1: "#e2d5d6",
  ground2: "#cfcdd2",
  sun: "#ffd8c6",
  sunA: 0.75,
  sunX: 86,
  sunY: 30,
  pool: "#ffe6d6",
  poolA: 0.5,
  poolX: 70,
  shade: "#5b6488",
  shadeA: 0.18,
  g1: "#9ab894",
  g2: "#6a9a78",
  g3: "#3b7a58",
  g4: "#275a4a",
  stem: "#4f7f62",
  wood: "#6a5f5a",
  straw: "#cdb98a",
  p1: "#fff8f0",
  p3: "#f0dd98",
  yolk: "#e0ac48",
  sh: "#4f5a86",
  shA: 0.2,
  shx: 2.3,
  shy: -0.14,
  hud: "#2c3348",
  halo: "#f1e4e4",
}

const morning: Light = {
  ...day,
  sky1: "#c5d6de",
  sky2: "#eef0e2",
  sun: "#fff6dc",
  sunA: 0.7,
  sunX: 80,
  sunY: 14,
  pool: "#fffbe6",
  poolX: 64,
  shade: "#6f8478",
  shadeA: 0.12,
  sh: "#3f5e58",
  shA: 0.26,
  shx: 1.2,
  shy: -0.22,
}

const afternoon: Light = {
  ...day,
  sky2: "#f0eedc",
  sunX: 24,
  sunY: 12,
  poolX: 38,
  shx: -1.0,
  shy: -0.22,
}

const golden: Light = {
  ...day,
  sky1: "#c3cbd6",
  sky2: "#f4dba6",
  ground1: "#e9dcb6",
  ground2: "#d6c597",
  sun: "#ffcf73",
  sunA: 0.85,
  sunX: 10,
  sunY: 32,
  pool: "#ffe9ae",
  poolA: 0.6,
  poolX: 30,
  shade: "#7a5a4a",
  shadeA: 0.16,
  g1: "#b7b765",
  g2: "#869c48",
  g3: "#457a30",
  g4: "#2d5630",
  stem: "#5f7a3c",
  wood: "#6b5540",
  straw: "#d9b865",
  p1: "#fff3d6",
  p2: "#b79ac4",
  p3: "#f2d47a",
  yolk: "#e09a30",
  sh: "#5b4763",
  shA: 0.26,
  shx: -2.1,
  shy: -0.15,
  hud: "#33301f",
  halo: "#f4e6bf",
}

const dusk: Light = {
  ...night,
  sky1: "#232a4d",
  sky2: "#a96a7c",
  ground1: "#4a4763",
  ground2: "#2a2e47",
  sun: "#ff9a78",
  sunA: 0.5,
  sunX: 6,
  sunY: 36,
  pool: "#b98aa0",
  poolA: 0.18,
  poolX: 24,
  shade: "#0d1024",
  shadeA: 0.4,
  g1: "#8fae96",
  g2: "#6a927f",
  g3: "#4a776b",
  g4: "#345c58",
  stem: "#527a6c",
  wood: "#5c5a66",
  straw: "#a99d86",
  p1: "#e9e2ea",
  p2: "#a79ad6",
  p3: "#d6c79a",
  yolk: "#cfa868",
  sh: "#0b0d20",
  shA: 0.3,
  shx: -2.8,
  shy: -0.12,
  hud: "#e6e1ee",
  halo: "#232a4d",
  stars: 0.25,
}

export const DAY = day
export const NIGHT = night

// Hours of the day (0 to 24) and the light at each. Between two entries the
// light is a blend of both.
const KEYFRAMES: [number, Light][] = [
  [0, night],
  [4.7, night],
  [6.1, dawn],
  [8.5, morning],
  [12.5, day],
  [15.5, afternoon],
  [17.6, golden],
  [19.1, dusk],
  [20.6, night],
  [24, night],
]

// The page below the scene has two states only. It is dark while the ground
// of the scene is dark: from just before dusk until just before dawn.
export const isDark = (hour: number) => hour < 5.4 || hour >= 18.5

// What to call the light at an hour.
export function nameOf(hour: number) {
  if (hour < 4.7 || hour >= 20.4) return "night"
  if (hour < 7.2) return "dawn"
  if (hour < 11) return "morning"
  if (hour < 14) return "midday"
  if (hour < 16.6) return "afternoon"
  if (hour < 18.4) return "golden hour"
  return "dusk"
}

type Rgb = [number, number, number]
const rgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb
const hex = (c: Rgb) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`
const mix = (a: string, b: string, k: number) => {
  const [x, y] = [rgb(a), rgb(b)]
  return hex([0, 1, 2].map((i) => x[i]! + (y[i]! - x[i]!) * k) as Rgb)
}
const alpha = (colour: string, a: number) =>
  `rgb(${rgb(colour).join(" ")} / ${Math.round(a * 100) / 100})`

export function lightAt(hour: number): Light {
  const h = ((hour % 24) + 24) % 24
  let i = 0
  while (i < KEYFRAMES.length - 2 && KEYFRAMES[i + 1]![0] <= h) i++
  const [t0, a] = KEYFRAMES[i]!
  const [t1, b] = KEYFRAMES[i + 1]!
  const linear = (h - t0) / (t1 - t0)
  // ease in and out of each state, so the light rests at a state and moves
  // between two
  const k = linear * linear * (3 - 2 * linear)
  const out = {} as Record<string, string | number>
  for (const key of Object.keys(a) as (keyof Light)[]) {
    const [x, y] = [a[key], b[key]]
    out[key] =
      typeof x === "number" ? x + ((y as number) - x) * k : mix(x as string, y as string, k)
  }
  return out as unknown as Light
}

// The page colour under each of the two themes (--light in quartz.config.yaml).
// The scene dissolves into it at its foot, and inner pages carry a trace of
// the sky at their head.
export const PAGE = { light: "#f2f3ea", dark: "#0c1219" }

// A light as CSS custom properties.
export function cssVars(l: Light, dark: boolean): Record<string, string> {
  const n = (v: number) => String(Math.round(v * 100) / 100)
  // A plant is drawn flat, facing the viewer. When the light comes from the
  // side its shadow would be a line, so the more sideways the light, the more
  // of the plant's width is turned into the depth of the ground. (The sign
  // follows the light so that the two skews never cancel into a line.)
  const side = Math.min(1, Math.abs(l.shx) / 2.2)
  return {
    "--l-sky1": l.sky1,
    "--l-sky2": l.sky2,
    "--l-ground1": l.ground1,
    "--l-ground2": l.ground2,
    "--l-sun": alpha(l.sun, l.sunA),
    "--l-sun-x": `${n(l.sunX)}%`,
    "--l-sun-y": `${n(l.sunY)}%`,
    "--l-pool": alpha(l.pool, l.poolA),
    "--l-pool-x": `${n(l.poolX)}%`,
    "--l-shade": alpha(l.shade, l.shadeA),
    "--l-far": mix(l.ground1, l.g4, 0.3),
    "--g1": l.g1,
    "--g2": l.g2,
    "--g3": l.g3,
    "--g4": l.g4,
    "--stem": l.stem,
    "--wood": l.wood,
    "--straw": l.straw,
    "--p1": l.p1,
    "--p2": l.p2,
    "--p3": l.p3,
    "--yolk": l.yolk,
    "--sh": alpha(l.sh, l.shA),
    "--sha": n(1 - 0.75 * side),
    "--shb": n(0.3 * side * Math.sign(l.shx)),
    "--shx": n(l.shx),
    "--shy": n(l.shy),
    "--l-hud": l.hud,
    "--l-halo": l.halo,
    "--l-stars": n(l.stars),
    "--l-tint": dark ? mix(PAGE.dark, l.sky2, 0.6) : mix(PAGE.light, l.sky1, 0.35),
  }
}

export const declarations = (vars: Record<string, string>) =>
  Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")
