// Grows one plant for one note and draws it into a raster layer.
//
// The drawing is a function of the note, so the same note always grows the
// same plant, and a plant changes only when its note does:
//
//   height   the length of the note (one level for each doubling of words)
//   flowers  one for each link between this note and another, in either
//            direction, in the second ink
//   species  the folder the note is filed in; a post is always a daisy
//   habit    which side a leaf takes and how the stem leans come from a
//            random sequence seeded with the note's slug

import { curve, disc, leaf, path, seg, type Plate, type Point } from "./raster"

export interface Note {
  // the note's slug
  seed: string
  words: number
  linksOut: number
  linksIn: number
}

export type Species = "bay" | "fern" | "reed" | "gum" | "daisy"

const NOTE_SPECIES: Species[] = ["bay", "fern", "reed", "gum"]

// FNV-1a
export function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// mulberry32
export function random(seed: string) {
  let a = hash(seed)
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Notes in one folder are one species, so a bed shows where its notes are from.
export function speciesOf(slug: string): Species {
  const parts = slug.split("/")
  if (parts[0] === "posts") return "daisy"
  const folder = parts.slice(0, -1).join("/")
  // the top byte of the hash: its low bits fall the same way for many of
  // the folders, and most notes came up as one species
  return NOTE_SPECIES[(hash(folder) >>> 24) % NOTE_SPECIES.length]!
}

// One level for each doubling of the note's length, from 40 words up.
export function levelsOf(words: number) {
  return Math.max(1, Math.min(7, Math.round(Math.log2(Math.max(words, 40) / 40))))
}

const along = (points: Point[], t: number): Point =>
  points[Math.max(0, Math.min(points.length - 1, Math.round(t * (points.length - 1))))]!

// Draws the plant of `note` into `L`, rooted at (x, ground), `scale` times
// life size.
export function drawPlant(L: Plate, note: Note, x: number, ground: number, scale = 1) {
  const rand = random(note.seed)
  const species = speciesOf(note.seed)
  const levels = levelsOf(note.words)
  const flowers = Math.min(note.linksOut + note.linksIn, 6)
  const s = scale

  if (species === "fern") {
    // fronds arch out from the crown; a flower is a fiddlehead still coiled
    const fronds = 3 + Math.floor(levels / 2)
    for (let n = 0; n < fronds; n++) {
      const spread = (n / (fronds - 1)) * 2 - 1
      const dir = spread * 1.1 + (rand() - 0.5) * 0.3
      const len = (14 + levels * 5.4) * (0.7 + rand() * 0.3) * s * (1 - Math.abs(spread) * 0.3)
      const tip: Point = [x + Math.sin(dir) * len * 1.05, ground - Math.cos(dir) * len * 0.82]
      const mid: Point = [x + Math.sin(dir) * len * 0.3, ground - len * 0.85]
      const rachis = curve([x, ground], mid, tip, Math.ceil(len))
      path(L, rachis, 1.1, 1, 1, 0)
      for (let k = 2; k < rachis.length - 1; k += 2) {
        const [ax, ay] = rachis[k]!
        const [bx, by] = rachis[k + 1]!
        const t = k / rachis.length
        const reach = (1.2 + 3.8 * Math.sin(Math.PI * Math.pow(t, 0.8))) * s
        const nx = -(by - ay)
        const ny = bx - ax
        const tone = n % 2 === 0 ? 1 : 0.6
        seg(L, ax, ay, ax + nx * reach + (bx - ax), ay + ny * reach + (by - ay), 1, tone, 0)
        seg(L, ax, ay, ax - nx * reach + (bx - ax), ay - ny * reach + (by - ay), 1, tone, 0)
      }
    }
    for (let n = 0; n < flowers; n++) {
      const dx = (n % 2 ? 1 : -1) * (2 + rand() * 5) * s
      const top = ground - (6 + rand() * 4 + n * 2.5) * s
      path(L, curve([x, ground], [x + dx * 0.2, top], [x + dx, top], 6), 1, 1, 1, 0)
      disc(L, x + dx, top, 1.9 * s + 0.2, 0, 1)
    }
    return
  }

  if (species === "reed") {
    // blades fan from the root; a flower is a seed head at the tip of a blade
    const blades = 4 + levels
    const height = (16 + levels * 5.4) * s
    for (let n = 0; n < blades; n++) {
      const top = height * (n < Math.max(1, flowers) ? 0.82 + rand() * 0.18 : 0.4 + rand() * 0.5)
      const lean = (rand() - 0.5) * top * 0.75
      const from: Point = [x + (rand() - 0.5) * 3 * s, ground]
      const blade = curve(
        from,
        [from[0] + lean * 0.1, ground - top * 0.7],
        [from[0] + lean, ground - top],
        Math.ceil(top / 1.5),
      )
      path(L, blade, n < flowers ? 1.2 : 1.7, 1, n % 3 === 2 ? 0.6 : 1, 0)
      if (n < flowers) {
        const [tx, ty] = blade[blade.length - 1]!
        const [qx, qy] = blade[blade.length - 2]!
        const d = Math.hypot(tx - qx, ty - qy) || 1
        const head = (4.5 + rand() * 2) * s
        seg(L, tx, ty, tx + ((tx - qx) / d) * head, ty + ((ty - qy) / d) * head, 2.5 * s, 0, 1)
      }
    }
    return
  }

  // The other three are a stem with a leaf or a flower at each joint.
  const daisy = species === "daisy"
  const height = (daisy ? 14 + levels * 5.2 : 9 + levels * 4.6) * s
  const lean = (rand() - 0.5) * Math.min(12, height * 0.4)
  const top: Point = [x + lean, ground - height]
  const stem = curve(
    [x, ground],
    [x - lean * 0.4 + (rand() - 0.5) * 4, ground - height * 0.55],
    top,
    Math.ceil(height),
  )
  path(L, stem, levels >= 4 ? 1.9 : 1.3, 1.1, 1, 0)

  // A joint is one place on the stem with a slot on each side. The first
  // side of a joint always bears a leaf and the sides alternate up the stem;
  // the second side bears one two times in three. Flowers then take slots in
  // seeded order: an empty one if there is one, a leaf's if not. A daisy
  // flowers at the top instead, and keeps its leaves low.
  const joints = Math.max(2, daisy ? Math.ceil(levels / 2) + 1 : levels)
  type Slot = "leaf" | "flower" | undefined
  const slots: [Slot, Slot][] = []
  let side = rand() < 0.5 ? 0 : 1
  for (let joint = 0; joint < joints; joint++) {
    const slot: [Slot, Slot] = [undefined, undefined]
    slot[side] = "leaf"
    if (rand() < 0.66) slot[1 - side] = "leaf"
    slots.push(slot)
    side = 1 - side
  }
  if (!daisy) {
    const order: [number, number][] = []
    slots.forEach((slot, joint) => slot.forEach((_, sd) => order.push([joint, sd])))
    order.sort((a, b) => {
      const empty =
        Number(slots[b[0]]![b[1]] === undefined) - Number(slots[a[0]]![a[1]] === undefined)
      return empty || hash(`${note.seed}/${a}`) - hash(`${note.seed}/${b}`)
    })
    for (let n = 0; n < flowers && n < order.length - 1; n++) {
      const [joint, sd] = order[n]!
      slots[joint]![sd] = "flower"
    }
  }

  for (let joint = 0; joint < joints; joint++) {
    const t = ((joint + 0.7) / (joints + 0.6)) * (daisy ? 0.6 : 0.92)
    const [jx, jy] = along(stem, t)
    for (const sd of [0, 1]) {
      const slot = slots[joint]![sd]
      if (!slot) continue
      const dir = sd === 0 ? -1 : 1
      // leaves near the top are shorter and point further up
      const taper = 1 - (joint / joints) * 0.4
      const rise = 0.25 + rand() * 0.5 + (joint / joints) * 0.3
      const angle = dir > 0 ? -rise : Math.PI + rise
      if (slot === "flower") {
        const reach = (3.5 + rand() * 2.5) * s
        const fx = jx + Math.cos(angle) * reach
        const fy = jy + Math.sin(angle) * reach - 1
        seg(L, jx, jy, fx, fy, 1, 1, 0)
        disc(L, fx, fy, (2.1 + rand() * 0.6) * s, 0, 1)
      } else if (species === "gum") {
        // a round leaf on a short stalk, dark below and light above
        const size = (2.1 + rand() * 1.2) * s * taper
        const lx = jx + Math.cos(angle) * (size + 2.2 * s)
        const ly = jy + Math.sin(angle) * (size + 2.2 * s)
        seg(L, jx, jy, lx, ly, 1, 1, 0)
        disc(L, lx, ly, size, 1, 0)
        disc(L, lx - 0.5 * dir, ly - 0.7, size * 0.6, 0.5, 0)
      } else {
        const len = (daisy ? 9 + rand() * 4 : 8 + rand() * 5) * s * taper
        leaf(L, jx, jy, angle, len, len * (daisy ? 0.36 : 0.46), 0.5, 1)
      }
    }
  }

  if (daisy) {
    // one flower head at the top, and a smaller one on a side stem for each link
    const heads: [Point, number][] = [[top, 1]]
    for (let n = 0; n < Math.min(flowers, 3); n++) {
      const [bx, by] = along(stem, 0.58 + n * 0.12)
      const dir = (n % 2 === 0 ? 1 : -1) * (lean > 0 ? -1 : 1)
      const at: Point = [bx + dir * (6 + rand() * 3) * s, by - (5 + rand() * 4) * s]
      path(L, curve([bx, by], [bx + dir * 2 * s, at[1] + 1], at, 6), 1, 1, 1, 0)
      heads.push([at, 0.72])
    }
    for (const [[hx, hy], size] of heads) {
      const petals = 7 + Math.floor(rand() * 3)
      const ring = 3.6 * s * size
      const turn = rand() * Math.PI
      for (let n = 0; n < petals; n++) {
        const a = turn + (n / petals) * Math.PI * 2
        disc(L, hx + Math.cos(a) * ring, hy + Math.sin(a) * ring, 1.75 * s * size, 0, 1)
      }
      disc(L, hx, hy, ring * 0.8, 0, 1)
      // both inks on the eye of the flower: it prints as the overprint colour
      disc(L, hx, hy, 1.7 * s * size, 1, 1)
    }
    return
  }

  // the growing tip
  const [qx, qy] = stem[stem.length - 3]!
  const tipLen = (7 + Math.min(levels, 5)) * s
  if (species === "gum") {
    disc(L, top[0], top[1] - 1, 2.4 * s, 1, 0)
    disc(L, top[0] - 0.5, top[1] - 1.7, 1.4 * s, 0.5, 0)
  } else {
    leaf(L, top[0], top[1], Math.atan2(top[1] - qy, top[0] - qx), tipLen, tipLen * 0.42, 0.5, 1)
  }
}
