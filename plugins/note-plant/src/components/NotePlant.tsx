import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { dateOf, isoDate } from "../../../shared/listing"
import { growPlant } from "./ascii"
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
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    const slug = (fileData.slug ?? "") as string
    // notes only: not the homepage, folder pages, tag pages or the 404 page
    if (!slug || slug === "index" || slug.endsWith("/index") || slug === "404") return null
    if (slug === "tags" || slug.startsWith("tags/")) return null
    if (roots.length > 0 && !roots.some((root) => slug.startsWith(`${root}/`))) return null

    const { words, linksOut, linksIn } = noteStats(fileData, allFiles)
    const plant = growPlant({ seed: slug, words, linksOut, linksIn })
    const date = dateOf(fileData, cfg)

    const description =
      `A plant drawn in text from this note. Its height comes from the note's length, ` +
      `it has ${plural(plant.leaves, "leaf", "leaves")} for the notes it links to ` +
      `and ${plural(plant.flowers, "flower", "flowers")} for the notes that link here.`

    return (
      <figure class={`note-plant ${displayClass ?? ""}`}>
        <pre role="img" aria-label={description}>
          {plant.lines.join("\n")}
        </pre>
        <figcaption>
          {date && (
            <>
              tended <time datetime={date.toISOString()}>{isoDate(date)}</time> ·{" "}
            </>
          )}
          {plural(words, "word", "words")} · {plural(linksOut, "link", "links")} out ·{" "}
          {plural(linksIn, "link", "links")} in
        </figcaption>
      </figure>
    )
  }

  NotePlant.css = style
  return NotePlant
}) satisfies QuartzComponentConstructor
