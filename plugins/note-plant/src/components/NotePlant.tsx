import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { speciesOf, type Species } from "../../../shared/garden/plants"
import { dateOf, dayMonthYear } from "../../../shared/pages"
// @ts-expect-error: bundled to a string by plugins/build.mjs
import script from "../../../shared/garden/garden.inline.ts"
import { noteStats } from "./stats"
import style from "./styles/notePlant.scss"

export interface NotePlantOptions {
  // Folder slugs to draw plants in. Empty means every note.
  roots: string[]
}

const defaultOptions: NotePlantOptions = {
  roots: [],
}

const names: Record<Species, string> = {
  bay: "A bay",
  fern: "A fern",
  reed: "A reed",
  gum: "A gum",
  daisy: "A daisy",
}

// The colophon: the note's own plant as a small two-ink stamp, with the date
// the note was last tended and what the plant is grown from. The browser
// draws the stamp (plugins/shared/garden); with scripting off only the
// caption shows.
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
    const species = speciesOf(slug)
    const links = linksOut + linksIn
    const date = dateOf(fileData, cfg)

    // "Notes/Microsoft/Intune/Error codes.md" is filed in "Microsoft / Intune"
    const folders = ((fileData.relativePath ?? "") as string).split("/").slice(0, -1)
    const filed =
      species === "daisy"
        ? "like every post"
        : folders.length > 1
          ? `like every note in ${folders.slice(1).join(" / ")}`
          : folders.length === 1
            ? `like every loose note in ${folders[0]}`
            : "like every page that stands alone"

    return (
      <figure class={`garden garden-stamp ${displayClass ?? ""}`} data-garden="stamp">
        <div class="garden-plate">
          <canvas
            data-w="44"
            data-h="62"
            data-seed={slug}
            data-words={words}
            data-out={linksOut}
            data-in={linksIn}
            aria-hidden="true"
          />
        </div>
        <figcaption>
          {date && (
            <p class="garden-tended">
              Tended <time datetime={date.toISOString()}>{dayMonthYear(date, cfg.locale)}</time>
            </p>
          )}
          <p>
            {names[species]}, {filed}. It stands {words.toLocaleString("en")}{" "}
            {words === 1 ? "word" : "words"} tall, with a {species === "daisy" && "side "}flower for
            every link to or from another note: {links === 0 ? "none" : links} so far.
          </p>
        </figcaption>
      </figure>
    )
  }

  NotePlant.css = style
  NotePlant.afterDOMLoaded = script
  return NotePlant
}) satisfies QuartzComponentConstructor
