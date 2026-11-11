export interface PlantInput {
  // What makes one plant differ from another with the same numbers: the slug.
  seed: string
  words: number
  linksOut: number
  linksIn: number
}

export interface AsciiPlant {
  // Top to bottom, every line WIDTH characters wide. The last line is the soil.
  lines: string[]
  // What the drawing shows. A short note has room for only so many.
  leaves: number
  flowers: number
}

// stem in the middle, two columns each side for a leaf or a twig
export const WIDTH = 5

// A deterministic stream of numbers in [0, 1) from a string (xmur3 into
// mulberry32), so that a note keeps its plant from build to build.
function random(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Grows a plant from a note's numbers:
//
//     *        a flower at the tip: something links here
//    \|        a leaf: a link out
//   o-|/       a flower on a twig: another link in
//     |
//   __|__
//
// The stem is one line taller each time the note doubles in length, from one
// line at 60 words to eight at 7,680.
export function growPlant({ seed, words, linksOut, linksIn }: PlantInput): AsciiPlant {
  const rand = random(seed)
  const height = Math.min(8, Math.max(1, 1 + Math.floor(Math.log2(Math.max(words, 60) / 60))))

  // one slot each side of every line of stem; line 0 is the lowest
  type Slot = "" | "leaf" | "flower"
  const left: Slot[] = Array<Slot>(height).fill("")
  const right: Slot[] = Array<Slot>(height).fill("")

  // Leaves take a line each, in a shuffled order, on alternating sides; when
  // every line has one they double up.
  const order = [...Array(height).keys()]
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  const leaves = Math.min(linksOut, height * 2)
  const sides = rand() < 0.5 ? [left, right] : [right, left]
  for (let n = 0; n < leaves; n++) {
    const turn = n % height
    // the second time round, a line takes its leaf on the other side
    const side = sides[(turn + (n < height ? 0 : 1)) % 2]
    side[order[turn]] = "leaf"
  }

  // The first link in flowers at the tip. The rest go on twigs in the free
  // slots, from the top down.
  const free = height * 2 - leaves
  const flowers = Math.min(linksIn, 1 + free)
  let twigs = flowers - 1
  for (let line = height - 1; line >= 0 && twigs > 0; line--) {
    for (const side of rand() < 0.5 ? [left, right] : [right, left]) {
      if (twigs > 0 && side[line] === "") {
        side[line] = "flower"
        twigs--
      }
    }
  }

  const lines = [`  ${flowers > 0 ? "*" : "'"}  `]
  for (let line = height - 1; line >= 0; line--) {
    const l = left[line] === "leaf" ? " \\" : left[line] === "flower" ? "o-" : "  "
    const r = right[line] === "leaf" ? "/ " : right[line] === "flower" ? "-o" : "  "
    lines.push(`${l}|${r}`)
  }
  lines.push("__|__")
  return { lines, leaves, flowers }
}
