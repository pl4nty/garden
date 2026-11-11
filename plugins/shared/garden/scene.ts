// Composes the two pictures the site prints: the bed (the banner on the
// homepage, a plant for each recently tended note) and the stamp (one note's
// plant in front of the sun, at the foot of that note).

import { drawPlant, random, speciesOf, type Note } from "./plants"
import { disc, Plate, stamp } from "./raster"

export interface Planted {
  // index of the note in the list the picture was grown from
  index: number
  // the cells the plant covers, and the box that holds them
  cells: Int32Array
  x0: number
  y0: number
  x1: number
  y1: number
}

export interface Picture {
  plate: Plate
  // ink 2 printed over everything: the sun, and whatever is lit on top of it
  over: Float32Array
  plants: Planted[]
}

// Smooth noise in one and two dimensions, from a seeded table.
function noise(seed: string) {
  const rand = random(seed)
  const table = Array.from({ length: 256 }, rand)
  const at = (i: number, j: number) => table[(i * 37 + j * 101) & 255]!
  const ease = (t: number) => t * t * (3 - 2 * t)
  return (x: number, y = 0) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const u = ease(x - xi)
    const v = ease(y - yi)
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * u
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * u
    return a + (b - a) * v
  }
}

function plant(
  plate: Plate,
  layer: Plate,
  note: Note,
  index: number,
  x: number,
  ground: number,
  scale: number,
): Planted {
  drawPlant(layer, note, x, ground, scale)
  const { x0, y0, x1, y1 } = layer
  const cells = stamp(plate, layer)
  return { index, cells, x0, y0, x1, y1 }
}

// Cuts the sun away from the flowers and one cell around them, so that a
// flower in front of the sun shows as a spot of ink 2 in a ring of paper.
function clearFlowers(plate: Plate, sun: Float32Array, plants: Planted[]) {
  const { w, h, g, p } = plate
  for (const { cells } of plants) {
    for (const k of cells) {
      if (p[k]! === 0 || g[k]! > 0) continue
      const i = k % w
      const j = (k - i) / w
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          if (i + di >= 0 && i + di < w && j + dj >= 0 && j + dj < h) sun[k + dj * w + di] = 0
        }
      }
    }
  }
}

// The bed, `w` by `h` cells. `notes` are in the order they were tended,
// newest first. The first notes stand in the front row. Behind them, a little
// smaller, stand the posts (the daisies) with more notes between them. `day`
// seeds the hedges, so the background changes from one day to the next and
// the plants do not. `hour` (0 to 24) puts the sun, or after dark the moon,
// on its arc.
export function drawBed(w: number, h: number, notes: Note[], day: string, hour: number): Picture {
  const plate = new Plate(w, h)
  const layer = new Plate(w, h)
  const over = new Float32Array(w * h)
  const ground = h - 5
  const rand = random(day)
  const grain = noise(`${day}/grain`)

  // Two hedges, one behind the other. Each is a row of round treetops
  // along a wandering line, filled down to the ground with one tint; the
  // nearer the hedge, the lower and the darker.
  const hedges: [number, number, number][] = [
    [0.5, 0.11, 10],
    [0.28, 0.24, 7],
  ]
  hedges.forEach(([height, tint, size], n) => {
    const line = noise(`${day}/hedge/${n}`)
    const top = new Float32Array(w).fill(h)
    for (let x = -size; x < w + size; x += size * (0.7 + rand() * 0.8)) {
      const r = size * (0.7 + rand() * 0.7)
      const cy = ground - h * height * (0.45 + 0.75 * line(x / 30)) + r * 0.3
      for (let i = Math.max(0, Math.floor(x - r)); i <= Math.min(w - 1, Math.ceil(x + r)); i++) {
        const dx = i + 0.5 - x
        top[i] = Math.min(top[i]!, cy - Math.sqrt(Math.max(0, r * r - dx * dx)))
      }
    }
    for (let i = 0; i < w; i++) {
      for (let j = Math.max(0, Math.round(top[i]!)); j < ground; j++) {
        // a lighter rim where the treetops face the sky, and a leafy grain
        const rim = j - top[i]! < 2 ? -0.05 : 0
        plate.g[j * w + i] = tint + rim + 0.07 * grain(i / 3, j / 2.5)
      }
    }
  })

  // the sun by day, a crescent moon by night, on an arc across the sky
  const day12 = hour >= 6 && hour < 18
  const t = ((((hour + (day12 ? -6 : 6)) % 24) + 24) % 24) / 12
  const r = Math.min(10, h * 0.17)
  const sx = w * (0.1 + 0.8 * t)
  const sy = r + 6 + (1 - Math.sin(Math.PI * t)) * h * 0.3
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const d = Math.hypot(i + 0.5 - sx, j + 0.5 - sy)
      let cover = d <= r ? 1 : Math.max(0, 0.42 - (d - r) / (r * 1.6))
      // the moon: the same disc with a bite out of it, and no glow
      if (!day12)
        cover =
          d <= r && Math.hypot(i + 0.5 - sx - r * 0.5, j + 0.5 - sy + r * 0.25) > r * 0.9 ? 1 : 0
      over[j * w + i] = cover
    }
  }

  // The front row holds as many plants as the width allows, the back row
  // one more. Three places in five of the back row go to posts.
  const front = Math.max(3, Math.floor((w - 6) / 17))
  const back = front + 1
  const index = notes.map((_, i) => i)
  const isPost = (i: number) => speciesOf(notes[i]!.seed) === "daisy"
  const firstRow = index.filter((i) => !isPost(i)).slice(0, front)
  const posts = index.filter(isPost).slice(0, Math.ceil(back * 0.6))
  const others = index.filter((i) => !isPost(i) && !firstRow.includes(i))
  const secondRow: number[] = []
  for (let k = 0, p = 0, o = 0; k < back; k++) {
    // spread the posts evenly along the row
    const post = Math.floor(((k + 1) * posts.length) / back) > Math.floor((k * posts.length) / back)
    const pick = post ? posts[p++] : others[o++]
    if (pick !== undefined) secondRow.push(pick)
  }

  const plants: Planted[] = []
  const row = (members: number[], count: number, scale: number, base: number) => {
    const rand = random(`row/${count}/${scale}`)
    members.forEach((i, k) => {
      const x = ((k + 0.5) / count) * w + (rand() - 0.5) * 4
      plants.push(plant(plate, layer, notes[i]!, i, x, base, scale))
    })
  }
  row(secondRow, back, 0.8, ground)
  row(firstRow, front, 1, ground + 1)

  // the ground: a line in both inks, and soil below it in ink 1, flecked
  for (let j = ground; j < h; j++) {
    for (let i = 0; i < w; i++) {
      plate.g[j * w + i] = 1
      plate.p[j * w + i] = j === ground ? 1 : 0.2
    }
  }

  clearFlowers(plate, over, plants)
  // the front row answers the pointer first
  plants.reverse()
  return { plate, over, plants }
}

// The stamp: one plant, life size, on a short piece of ground, with the sun
// behind it.
export function drawStamp(w: number, h: number, note: Note): Picture {
  const plate = new Plate(w, h)
  const layer = new Plate(w, h)
  const sun = new Plate(w, h)
  const ground = h - 3
  // the sun is half set, so that even a seedling stands in front of it
  disc(sun, w / 2, ground - 5, w * 0.36, 0, 1)
  sun.p.fill(0, ground * w)
  const planted = plant(plate, layer, note, 0, w / 2, ground + 1, 1)
  for (let i = 2; i < w - 2; i++) plate.g[ground * w + i] = 1
  clearFlowers(plate, sun.p, [planted])
  return { plate, over: sun.p, plants: [planted] }
}
