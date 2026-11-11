import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils"
import { noteStats } from "../../../note-plant/src/components/stats"
import { dayMonthYear, newestFirst, titleOf } from "../../../shared/pages"
// @ts-expect-error: bundled to a string by plugins/build.mjs
import script from "../../../shared/garden/garden.inline.ts"
import style from "./styles/home.scss"

export interface HomeOptions {
  // Folder slugs that hold the notes and the posts.
  notesFolder: string
  postsFolder: string
  // The most notes the bed can hold. The browser draws as many as fit the
  // width of the column, starting from the most recently tended.
  plants: number
  // Height of the picture, in cells.
  height: number
}

const defaultOptions: HomeOptions = {
  notesFolder: "notes",
  postsFolder: "posts",
  plants: 36,
  height: 64,
}

type Slug = Parameters<typeof resolveRelative>[0]

// The banner of the homepage: a garden bed with a plant for each of the most
// recently tended notes and for each post. The server writes the list of
// pages, each with the numbers its plant grows from; the browser draws the
// picture on the
// canvas (plugins/shared/garden) and lays each link over its plant. With
// scripting off the list stays hidden and the frame shows a halftone
// pattern from the stylesheet.
export default ((opts?: Partial<HomeOptions>) => {
  const options: HomeOptions = { ...defaultOptions, ...opts }

  const Home: QuartzComponent = ({
    fileData,
    allFiles,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    // The component sits in a slot that every content page shares.
    if (fileData.slug !== "index") return null

    const locale = cfg.locale || "en-US"
    const pages = [
      ...newestFirst(allFiles, cfg, [options.notesFolder]).slice(0, options.plants),
      ...newestFirst(allFiles, cfg, [options.postsFolder]),
    ]

    return (
      <figure class={`garden garden-bed ${displayClass ?? ""}`} data-garden="bed">
        <div class="garden-plate">
          <canvas data-h={options.height} aria-hidden="true" />
          <ol>
            {pages.map(({ f, date }) => {
              const { words, linksOut, linksIn } = noteStats(f, allFiles)
              return (
                <li>
                  <a
                    href={resolveRelative(fileData.slug as Slug, f.slug as Slug)}
                    data-seed={f.slug}
                    data-words={words}
                    data-out={linksOut}
                    data-in={linksIn}
                    data-label={`${titleOf(f)}, tended ${dayMonthYear(date, locale)}`}
                    hidden
                  >
                    {titleOf(f)}
                  </a>
                </li>
              )
            })}
          </ol>
        </div>
        <figcaption data-caption>
          A plant for each note I’ve tended lately, and a daisy for each post. Longer notes grow
          taller, and a flower opens for every link between two of them.
        </figcaption>
      </figure>
    )
  }

  Home.css = style
  Home.afterDOMLoaded = script
  return Home
}) satisfies QuartzComponentConstructor
