import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { formatDate, getDate } from "@quartz-community/utils"
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
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    const slug = (fileData.slug ?? "") as string
    // notes only: not the homepage, folder pages, tag pages or the 404 page
    if (!slug || slug === "index" || slug.endsWith("/index") || slug === "404") return null
    if (slug === "tags" || slug.startsWith("tags/")) return null
    if (roots.length > 0 && !roots.some((root) => slug.startsWith(`${root}/`))) return null

    const { words, linksOut, linksIn } = noteStats(fileData, allFiles)

    const plant = drawPlant({ seed: slug, words, linksOut, linksIn })

    const cfgDateType = (cfg as Record<string, unknown>).defaultDateType as string | undefined
    const dated = {
      ...fileData,
      defaultDateType: fileData.defaultDateType ?? cfgDateType,
    } as QuartzPluginData
    const date = dated.defaultDateType ? getDate(dated) : undefined

    const description =
      `A plant drawn from this note. Its height comes from the note's length, ` +
      `it has ${plural(plant.leaves, "leaf", "leaves")} for the notes it links to ` +
      `and ${plural(plant.buds, "bud", "buds")} for the notes that link here.`

    return (
      <figure class={`note-plant ${displayClass ?? ""}`}>
        <div
          class="note-plant-art"
          role="img"
          aria-label={description}
          dangerouslySetInnerHTML={{ __html: plant.svg }}
        />
        <figcaption>
          {date && (
            <p class="note-plant-tended">
              Tended{" "}
              <time datetime={date.toISOString()}>{formatDate(date, cfg.locale || "en-US")}</time>
            </p>
          )}
          <p class="note-plant-stats">
            {plural(words, "word", "words")} · {plural(linksOut, "link", "links")} out ·{" "}
            {plural(linksIn, "link", "links")} in
          </p>
        </figcaption>
      </figure>
    )
  }

  NotePlant.css = style
  return NotePlant
}) satisfies QuartzComponentConstructor
