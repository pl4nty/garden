// Prints the garden pictures in the browser. A picture is a <figure
// class="garden"> that holds a <canvas> and the notes to grow: every element
// with a `data-seed` (the links of the bed, or the canvas of a stamp). The
// canvas is drawn once at a few hundred cells and scaled up with
// `image-rendering: pixelated`; it is drawn again only when the theme, the
// width or the plant under the pointer changes.

import type { Note } from "./plants"
import { print, type Inks, type RGB } from "./raster"
import { drawBed, drawStamp, type Picture } from "./scene"

type Cleanup = (fn: () => void) => void

function rgb(value: string): RGB {
  const hex = value.trim().replace("#", "")
  const n = parseInt(hex.length === 3 ? hex.replace(/./g, "$&$&") : hex, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function inksOf(el: Element): Inks {
  const style = getComputedStyle(el)
  const ink = (name: string) => rgb(style.getPropertyValue(name))
  return { paper: ink("--paper"), ink1: ink("--ink1"), ink2: ink("--ink2"), over: ink("--over") }
}

function grow(figure: HTMLElement, cleanup: Cleanup) {
  const canvas = figure.querySelector("canvas")
  const ctx = canvas?.getContext("2d")
  if (!canvas || !ctx) return
  const frame = canvas.parentElement!
  const seeds = [...figure.querySelectorAll<HTMLElement>("[data-seed]")]
  const notes: Note[] = seeds.map((el) => ({
    seed: el.dataset.seed!,
    words: Number(el.dataset.words),
    linksOut: Number(el.dataset.out),
    linksIn: Number(el.dataset.in),
  }))
  const bed = figure.dataset.garden === "bed"
  // in the bed every seed is a link, and they lie over their plants
  const links = bed ? seeds : []
  const narrow = window.matchMedia("(max-width: 800px)")
  const caption = figure.querySelector<HTMLElement>("[data-caption]")
  const rest = caption?.textContent ?? ""

  let picture: Picture | undefined
  let cell = 0
  let lit = -1

  // Prints the picture; the plant under the pointer gets a coat of ink 2.
  const paint = () => {
    if (!picture) return
    const { plate, over, plants } = picture
    let top = over
    const plant = plants.find((p) => p.index === lit)
    if (plant) {
      top = over.slice()
      for (const k of plant.cells) top[k] = 1
    }
    const image = ctx.createImageData(plate.w, plate.h)
    print(plate, top, image.data, inksOf(figure))
    ctx.putImageData(image, 0, 0)
  }

  // Sizes the canvas to a whole number of cells and grows the picture.
  const layout = () => {
    const width = frame.clientWidth
    if (width === 0) return
    // three screen pixels to a cell in the bed, two on a narrow screen and in
    // a stamp (the stylesheet reserves the same heights)
    const size = bed && !narrow.matches ? 3 : 2
    const w = bed ? Math.floor(width / size) : Number(canvas.dataset.w)
    const h = Number(canvas.dataset.h)
    if (picture && picture.plate.w === w && cell === size) return
    cell = size
    canvas.width = w
    canvas.height = h
    canvas.style.width = `${w * size}px`
    canvas.style.height = `${h * size}px`
    if (bed) {
      const now = new Date()
      const day = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
      picture = drawBed(w, h, notes, day, now.getHours() + now.getMinutes() / 60)
    } else {
      picture = drawStamp(w, h, notes[0]!)
    }
    // lay each link over its plant; a note with no room in the bed has none
    links.forEach((a) => (a.hidden = true))
    if (bed) {
      picture.plants.forEach((p, order) => {
        const a = links[p.index]!
        a.hidden = false
        a.style.left = `${p.x0 * size}px`
        a.style.top = `${p.y0 * size}px`
        a.style.width = `${(p.x1 - p.x0 + 1) * size}px`
        a.style.height = `${(p.y1 - p.y0 + 1) * size}px`
        a.style.zIndex = String(picture!.plants.length - order)
      })
    }
    figure.classList.add("grown")
    paint()
  }

  const light = (index: number) => {
    if (lit === index) return
    lit = index
    if (caption) caption.textContent = index < 0 ? rest : (links[index]?.dataset.label ?? rest)
    paint()
  }

  links.forEach((a, index) => {
    const on = () => light(index)
    const off = () => light(-1)
    for (const type of ["pointerenter", "focus"]) a.addEventListener(type, on)
    for (const type of ["pointerleave", "blur"]) a.addEventListener(type, off)
  })

  let pending = 0
  const resized = () => {
    cancelAnimationFrame(pending)
    pending = requestAnimationFrame(layout)
  }
  window.addEventListener("resize", resized)
  document.addEventListener("themechange", paint)
  cleanup(() => {
    window.removeEventListener("resize", resized)
    document.removeEventListener("themechange", paint)
  })
  layout()
}

document.addEventListener("nav", () => {
  const cleanup: Cleanup = (fn) => (window as unknown as { addCleanup: Cleanup }).addCleanup(fn)
  for (const figure of document.querySelectorAll<HTMLElement>("figure.garden")) {
    grow(figure, cleanup)
  }
})
