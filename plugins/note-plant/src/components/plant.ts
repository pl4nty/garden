// Draws one plant as PCB traces, in the style of the homepage illustration
// (plugins/home/scripts/vine.mjs): a stem routed on 45 degree angles from a
// row of pads, leaves at the end of side traces, and vias at the joints.
//
// The drawing is a function of the note, so the same note always grows the
// same plant and a plant changes only when its note does:
//
//   height  the length of the note (one level for each doubling of words)
//   leaves  one for each note this one links to
//   buds    one for each note that links here
//   shape   which side a leaf or bud takes, and how the stem bends, come from
//           a random sequence seeded with the note's slug

export interface PlantInput {
  seed: string
  words: number
  linksOut: number
  linksIn: number
}

export interface Plant {
  svg: string
  width: number
  height: number
  leaves: number
  buds: number
}

type Point = [number, number]

const MAX_LEAVES = 10
const MAX_BUDS = 8
const LEVEL = 22
const WIDTH = 200

// mulberry32, seeded with an FNV-1a hash of the slug
function random(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const r = (n: number) => Math.round(n * 10) / 10
const pt = (p: Point) => `${r(p[0])} ${r(p[1])}`

// horizontal extent of what has been drawn, so the viewBox can fit the plant
let minX = Infinity
let maxX = -Infinity
const seen = (...points: Point[]) => {
  for (const [x] of points) {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
  }
}

const path = (points: Point[]) => {
  seen(...points)
  return `<path class="t" d="M${points.map(pt).join("L")}"/>`
}

// almond leaf from `base`, pointing along `dir`, `len` long
function leaf(base: Point, dir: Point, len: number) {
  const n = Math.hypot(dir[0], dir[1])
  const [ux, uy] = [dir[0] / n, dir[1] / n]
  const [px, py] = [-uy, ux]
  const w = len * 0.34
  const tip: Point = [base[0] + ux * len, base[1] + uy * len]
  const c1: Point = [base[0] + ux * len * 0.45 + px * w, base[1] + uy * len * 0.45 + py * w]
  const c2: Point = [base[0] + ux * len * 0.45 - px * w, base[1] + uy * len * 0.45 - py * w]
  const rib: Point = [base[0] + ux * len * 0.62, base[1] + uy * len * 0.62]
  seen(tip, c1, c2)
  return `<path class="f" d="M${pt(base)}Q${pt(c1)} ${pt(tip)}Q${pt(c2)} ${pt(base)}Z"/><path class="r" d="M${pt(base)}L${pt(rib)}"/>`
}

export function drawPlant({ seed, words, linksOut, linksIn }: PlantInput): Plant {
  const rand = random(seed)
  minX = Infinity
  maxX = -Infinity
  const leaves = Math.min(linksOut, MAX_LEAVES)
  const buds = Math.min(linksIn, MAX_BUDS)

  // a level is one place on the stem with a slot on each side
  const fromWords = Math.max(1, Math.min(7, Math.round(Math.log2(Math.max(words, 60) / 60))))
  const levels = Math.max(fromWords, Math.ceil((leaves + buds) / 2))

  // Fill the slots: leaves from the bottom, alternating sides from a seeded
  // start; buds take what is left, in seeded order.
  type Slot = "leaf" | "bud" | undefined
  const slots: [Slot, Slot][] = Array.from({ length: levels }, () => [undefined, undefined])
  let side = rand() < 0.5 ? 0 : 1
  const spread = Math.max(1, Math.floor((levels * 2) / Math.max(leaves, 1)))
  for (let i = 0, at = 0; i < leaves; i++, at += spread) {
    let level = Math.min(Math.floor(at / 2), levels - 1)
    while (slots[level]![side] !== undefined) {
      side = 1 - side
      if (slots[level]![side] !== undefined) level = (level + 1) % levels
    }
    slots[level]![side] = "leaf"
    side = 1 - side
  }
  const free: [number, number][] = []
  slots.forEach((s, level) => s.forEach((v, sd) => v === undefined && free.push([level, sd])))
  for (let i = 0; i < buds && free.length > 0; i++) {
    const [level, sd] = free.splice(Math.floor(rand() * free.length), 1)[0]!
    slots[level]![sd] = "bud"
  }

  const top = 34
  const height = top + levels * LEVEL + 30
  const baseY = height - 14
  const cx = WIDTH / 2

  const traces: string[] = []
  const leafShapes: string[] = []
  const vias: string[] = []
  const budShapes: string[] = []

  // stem: straight up through each level, with a seeded 45 degree jog between
  let x = cx
  let y = baseY
  const stem: Point[] = [[x, y]]
  y -= 16
  stem.push([x, y])
  for (let level = 0; level < levels; level++) {
    const nodeY = y - LEVEL / 2
    const [left, right] = slots[level]!
    for (const [slot, dir] of [
      [left, -1],
      [right, 1],
    ] as [Slot, number][]) {
      if (!slot) continue
      const out = 8 + rand() * 4
      const elbow: Point = [x + dir * out, nodeY - out]
      if (slot === "leaf") {
        // shorter runs near the top give the plant a taper
        const run = (6 + rand() * 16) * (1 - (level / levels) * 0.5)
        const end: Point = [elbow[0] + dir * run, elbow[1]]
        traces.push(path([[x, nodeY], elbow, end]))
        leafShapes.push(leaf(end, [dir, -0.35 - rand() * 0.6], 17 + rand() * 7))
      } else {
        traces.push(path([[x, nodeY], elbow]))
        seen([elbow[0] - 5, elbow[1]], [elbow[0] + 5, elbow[1]])
        budShapes.push(`<circle class="b" cx="${r(elbow[0])}" cy="${r(elbow[1])}" r="3.6"/>`)
      }
    }
    // every level has its via, so a long note with no links is still jointed
    vias.push(`<circle class="v" cx="${r(x)}" cy="${r(nodeY)}" r="2.6"/>`)
    y -= LEVEL
    stem.push([x, y + 6])
    // jog, but stay near the centre line
    const jog = level < levels - 1 && rand() < 0.55 ? (rand() < 0.5 ? -6 : 6) : 0
    const nx = Math.abs(x + jog - cx) > 12 ? x - jog : x + jog
    if (nx !== x) {
      stem.push([nx, y + 6 - Math.abs(nx - x)])
      x = nx
    }
    stem.push([x, y])
  }
  traces.unshift(path(stem))
  leafShapes.push(leaf([x, y], [0, -1], 20 + Math.min(levels, 5) * 2))

  // A note with no links yet is a seedling: two seed leaves at the base.
  if (leaves === 0 && buds === 0) {
    const at: Point = [cx, baseY - 12]
    leafShapes.push(leaf(at, [-1, -0.7], 13), leaf(at, [1, -0.7], 13))
  }

  seen([cx - 22, baseY], [cx + 22, baseY])
  const pads = [-16, 0, 16]
    .map((dx) => `<rect class="p" x="${cx + dx - 4}" y="${baseY}" width="8" height="12" rx="2"/>`)
    .join("")

  const left = Math.floor(minX) - 2
  const width = Math.ceil(maxX) + 2 - left
  const svg =
    `<svg viewBox="${left} 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
    `${pads}<g stroke-width="1.75">${traces.join("")}</g><g stroke-width="1.4">${leafShapes.join("")}</g>` +
    `<g stroke-width="1.75">${vias.join("")}${budShapes.join("")}</g></svg>`

  return { svg, width, height, leaves, buds }
}
