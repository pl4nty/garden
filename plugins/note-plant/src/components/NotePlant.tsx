import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { drawPlant } from "./plant"
import { noteStats } from "./stats"
import style from "./styles/notePlant.scss"

export interface NotePlantOptions {
  // Folder slugs to draw plants in. Empty means every note.
  roots: string[]
}

const defaultOptions: NotePlantOptions = {
  roots: [],
}

const plural = (n: number, one: string, many: string) =>
  `${n.toLocaleString("en")} ${n === 1 ? one : many}`

export default ((opts?: Partial<NotePlantOptions>) => {
  const options: NotePlantOptions = { ...defaultOptions, ...opts }
  const roots = options.roots.map((root) => root.replace(/\/$/, "").toLowerCase())

  const NotePlant: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const slug = (fileData.slug ?? "") as string
    // notes only: not the homepage, folder pages, tag pages or the 404 page
    if (!slug || slug === "index" || slug.endsWith("/index") || slug === "404") return null
    if (slug === "tags" || slug.startsWith("tags/")) return null
    if (roots.length > 0 && !roots.some((root) => slug.startsWith(`${root}/`))) return null

    const { words, linksOut, linksIn } = noteStats(fileData, allFiles)

    const plant = drawPlant({ seed: slug, words, linksOut, linksIn })

    const description =
      `A plant drawn from this note. Its height comes from the note's length, ` +
      `it has ${plural(plant.leaves, "leaf", "leaves")} for the notes it links to ` +
      `and ${plural(plant.buds, "bud", "buds")} for the notes that link here.`

    // "719 words tall, with 2 leaves for 2 links out and 1 bud for 1 link in."
    const grown = [
      linksOut > 0 &&
        `${plural(plant.leaves, "leaf", "leaves")} for ${plural(linksOut, "link", "links")} out`,
      linksIn > 0 &&
        `${plural(plant.buds, "bud", "buds")} for ${plural(linksIn, "link", "links")} in`,
    ].filter(Boolean)
    const caption =
      `${plural(words, "word", "words")} tall, ` +
      (grown.length > 0
        ? `with ${grown.join(" and ")}.`
        : "with no links in or out yet, so no leaves or buds.")

    return (
      <figure class={`note-plant ${displayClass ?? ""}`}>
        <div
          class="note-plant-art"
          role="img"
          aria-label={description}
          dangerouslySetInnerHTML={{ __html: plant.svg }}
        />
        <figcaption>
          <p class="note-plant-name">This note’s plant</p>
          <p class="note-plant-stats">{caption}</p>
        </figcaption>
      </figure>
    )
  }

  NotePlant.css = style
  return NotePlant
}) satisfies QuartzComponentConstructor
