// A two-plate raster, as on a risograph: one plate of coverage (0 to 1) for
// each ink. Shapes are drawn into the plates in cell coordinates, then each
// plate is screened to one bit with an ordered dither and the two are printed
// on the paper. Where both inks land on a cell, the cell takes the overprint
// colour.

export type Point = [number, number]

// 4x4 Bayer matrix: the threshold of a cell is its entry, plus a half, over 16
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

export class Plate {
  // ink 1 (green) and ink 2 coverage
  g: Float32Array
  p: Float32Array
  // cells that a shape has touched, and the box that holds them
  m: Uint8Array
  x0 = 0
  y0 = 0
  x1 = -1
  y1 = -1

  constructor(
    public w: number,
    public h: number,
  ) {
    this.g = new Float32Array(w * h)
    this.p = new Float32Array(w * h)
    this.m = new Uint8Array(w * h)
    this.reset()
  }

  reset() {
    this.x0 = this.w
    this.y0 = this.h
    this.x1 = -1
    this.y1 = -1
  }

  // Sets the coverage of both inks in one cell.
  set(i: number, j: number, g: number, p: number) {
    if (i < 0 || j < 0 || i >= this.w || j >= this.h) return
    const k = j * this.w + i
    this.g[k] = g
    this.p[k] = p
    this.m[k] = 1
    if (i < this.x0) this.x0 = i
    if (i > this.x1) this.x1 = i
    if (j < this.y0) this.y0 = j
    if (j > this.y1) this.y1 = j
  }
}

// A filled circle.
export function disc(L: Plate, cx: number, cy: number, r: number, g: number, p: number) {
  for (let j = Math.floor(cy - r); j <= Math.ceil(cy + r); j++) {
    for (let i = Math.floor(cx - r); i <= Math.ceil(cx + r); i++) {
      if (Math.hypot(i + 0.5 - cx, j + 0.5 - cy) <= r) L.set(i, j, g, p)
    }
  }
}

// A line with round ends, `width` cells thick.
export function seg(
  L: Plate,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
  g: number,
  p: number,
) {
  const r = width / 2
  const dx = x1 - x0
  const dy = y1 - y0
  const len2 = dx * dx + dy * dy || 1
  for (let j = Math.floor(Math.min(y0, y1) - r); j <= Math.ceil(Math.max(y0, y1) + r); j++) {
    for (let i = Math.floor(Math.min(x0, x1) - r); i <= Math.ceil(Math.max(x0, x1) + r); i++) {
      const px = i + 0.5 - x0
      const py = j + 0.5 - y0
      const t = Math.max(0, Math.min(1, (px * dx + py * dy) / len2))
      if (Math.hypot(px - t * dx, py - t * dy) <= r) L.set(i, j, g, p)
    }
  }
}

// A run of lines through `points`. The width goes from `w0` at the first
// point to `w1` at the last.
export function path(L: Plate, points: Point[], w0: number, w1: number, g: number, p: number) {
  for (let k = 0; k < points.length - 1; k++) {
    const a = points[k]!
    const b = points[k + 1]!
    const width = w0 + ((w1 - w0) * k) / Math.max(1, points.length - 2)
    seg(L, a[0], a[1], b[0], b[1], width, g, p)
  }
}

// `n` + 1 points along a quadratic curve.
export function curve(a: Point, c: Point, b: Point, n: number): Point[] {
  const out: Point[] = []
  for (let k = 0; k <= n; k++) {
    const t = k / n
    const u = 1 - t
    out.push([
      u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
      u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
    ])
  }
  return out
}

// An almond leaf from (bx, by) along `angle`. The half above the midrib takes
// the tone `lit`, the half below takes `shade`, so a leaf has a light side.
export function leaf(
  L: Plate,
  bx: number,
  by: number,
  angle: number,
  len: number,
  wid: number,
  lit: number,
  shade: number,
) {
  const ux = Math.cos(angle)
  const uy = Math.sin(angle)
  const r = len + 1
  // the light comes from above: the lit half is the one that faces up
  const up = ux >= 0 ? -1 : 1
  for (let j = Math.floor(by - r); j <= Math.ceil(by + r); j++) {
    for (let i = Math.floor(bx - r); i <= Math.ceil(bx + r); i++) {
      const px = i + 0.5 - bx
      const py = j + 0.5 - by
      const u = (px * ux + py * uy) / len
      if (u < 0 || u > 1) continue
      const v = -px * uy + py * ux
      // widest at two fifths of the length, pointed at the tip
      const half = (wid / 2) * Math.sin(Math.PI * Math.pow(u, 0.72)) + 0.35
      if (Math.abs(v) > half) continue
      L.set(i, j, v * up > 0.3 ? lit : shade, 0)
    }
  }
}

// Prints the cells a layer has touched onto `dst`, then wipes the layer.
// A one-cell margin of ink 1 is cleared around them first, so that the
// layer stands clear of what is behind it. Returns the indices of the cells
// it printed.
export function stamp(dst: Plate, L: Plate): Int32Array {
  const { w, h } = dst
  const cells: number[] = []
  if (L.x1 < 0) return new Int32Array(0)
  for (let j = Math.max(0, L.y0 - 1); j <= Math.min(h - 1, L.y1 + 1); j++) {
    for (let i = Math.max(0, L.x0 - 1); i <= Math.min(w - 1, L.x1 + 1); i++) {
      const k = j * w + i
      if (L.m[k]) continue
      const near =
        (i > 0 && L.m[k - 1]) ||
        (i < w - 1 && L.m[k + 1]) ||
        (j > 0 && L.m[k - w]) ||
        (j < h - 1 && L.m[k + w])
      if (near) dst.g[k] = 0
    }
  }
  for (let j = L.y0; j <= L.y1; j++) {
    for (let i = L.x0; i <= L.x1; i++) {
      const k = j * w + i
      if (!L.m[k]) continue
      dst.g[k] = L.g[k]!
      dst.p[k] = L.p[k]!
      cells.push(k)
      L.g[k] = 0
      L.p[k] = 0
      L.m[k] = 0
    }
  }
  L.reset()
  return Int32Array.from(cells)
}

export type RGB = [number, number, number]

export interface Inks {
  paper: RGB
  ink1: RGB
  ink2: RGB
  over: RGB
}

// Screens both plates and writes the print to `out` (RGBA, w * h * 4 bytes).
// `over` is a third plate of ink 2 that is printed on top of everything (the
// sun, and the plant under the pointer).
export function print(
  plate: Plate,
  over: Float32Array | undefined,
  out: Uint8ClampedArray,
  inks: Inks,
) {
  const { w, h, g, p } = plate
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const k = j * w + i
      const a = g[k]! > (BAYER[(j & 3) * 4 + (i & 3)]! + 0.5) / 16
      const cover = Math.max(p[k]!, over ? over[k]! : 0)
      // the second screen is turned against the first, so that two tints do
      // not land dot on dot
      const b = cover > (BAYER[((j + 2) & 3) * 4 + ((i + 1) & 3)]! + 0.5) / 16
      const c = a && b ? inks.over : a ? inks.ink1 : b ? inks.ink2 : inks.paper
      out[k * 4] = c[0]
      out[k * 4 + 1] = c[1]
      out[k * 4 + 2] = c[2]
      out[k * 4 + 3] = 255
    }
  }
}
