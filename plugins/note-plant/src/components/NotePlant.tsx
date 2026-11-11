import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { FOOT, drawPlant, plantSvg, speciesOf } from "./plant"
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

// "2 Jun 2026"
export const day = (date: Date, locale: string) =>
  date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })

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
    const plant = drawPlant({ seed: slug, words, linksOut, linksIn, species: speciesOf(slug) })

    const locale = cfg.locale || "en-US"
    const dates = fileData.dates as { created?: Date; modified?: Date } | undefined
    const tended = dates?.modified
    // Only a date written in the note counts as its planting: without one,
    // Quartz falls back to the file's creation time on the build machine.
    const written = Boolean(fileData.frontmatter?.created)
    const planted =
      written && dates?.created && tended && day(dates.created, locale) !== day(tended, locale)
        ? dates.created
        : undefined

    const description =
      `This note's plant. Its size comes from the note's length ` +
      `(${plural(words, "word", "words")}), its leaves from the ${plural(linksOut, "note", "notes")} ` +
      `it links to, and its flowers from the ${plural(linksIn, "note", "notes")} that link here.`

    return (
      <figure class={`note-plant ${displayClass ?? ""}`}>
        <div
          class="plant-box"
          role="img"
          aria-label={description}
          title={description}
          style={`--w:${plant.halfWidth * 2};--h:${plant.height + FOOT}`}
          dangerouslySetInnerHTML={{ __html: plantSvg(plant, "note-plant") }}
        />
        <figcaption>
          {planted && (
            <p>
              Planted <time datetime={planted.toISOString()}>{day(planted, locale)}</time>
            </p>
          )}
          {tended && (
            <p class={planted ? "note-plant-faint" : undefined}>
              Tended <time datetime={tended.toISOString()}>{day(tended, locale)}</time>
            </p>
          )}
          <p class="note-plant-faint note-plant-stats">
            {plural(words, "word", "words")}, {plural(linksOut, "link", "links")} out,{" "}
            {linksIn.toLocaleString("en")} in
          </p>
        </figcaption>
      </figure>
    )
  }

  NotePlant.css = style
  return NotePlant
}) satisfies QuartzComponentConstructor
