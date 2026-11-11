import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { getDate, resolveRelative } from "@quartz-community/utils"
import { drawPlant } from "../../../note-plant/src/components/plant"
import { noteStats } from "../../../note-plant/src/components/stats"
import { smallCaps } from "../../../shared/smallCaps"
import style from "./styles/home.scss"

export interface HomeOptions {
  // "bed" renders the row of plants (place it in beforeBody); "contents"
  // renders the lists that follow the page content (place it in afterBody).
  section: "bed" | "contents"
  // Folder slug that holds the posts.
  postsFolder: string
  // Folder slug that holds the notes.
  notesFolder: string
  // Bed: the number of plants. The most recently tended notes get one each.
  plants: number
  // Contents: the number of recently tended notes to list.
  recentCount: number
}

const defaultOptions: HomeOptions = {
  section: "contents",
  postsFolder: "posts",
  notesFolder: "notes",
  plants: 22,
  recentCount: 6,
}

type Slug = Parameters<typeof resolveRelative>[0]
type Dated = { f: QuartzPluginData; date: Date }

export default ((opts?: Partial<HomeOptions>) => {
  const options: HomeOptions = { ...defaultOptions, ...opts }
  const postsPrefix = `${options.postsFolder.replace(/\/$/, "")}/`
  const notesPrefix = `${options.notesFolder.replace(/\/$/, "")}/`

  const Home: QuartzComponent = ({
    fileData,
    allFiles,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    // The component sits in a slot that every content page shares.
    if (fileData.slug !== "index") return null

    const locale = cfg.locale || "en-US"
    const cfgDateType = (cfg as Record<string, unknown>).defaultDateType as string | undefined
    const dateOf = (f: QuartzPluginData) => {
      const data = { ...f, defaultDateType: f.defaultDateType ?? cfgDateType } as QuartzPluginData
      return data.defaultDateType ? getDate(data) : undefined
    }
    const href = (slug: string) => resolveRelative(fileData.slug as Slug, slug as Slug)
    const title = (f: QuartzPluginData) => (f.frontmatter?.title ?? f.slug ?? "") as string
    const month = (d: Date) => d.toLocaleDateString(locale, { month: "short", year: "numeric" })
    const newestFirst = (prefix: string): Dated[] =>
      allFiles
        .filter((f) => f.slug?.startsWith(prefix) && !f.slug.endsWith("/index"))
        .map((f) => ({ f, date: dateOf(f) }))
        .filter((n): n is Dated => Boolean(n.date))
        .sort((a, b) => b.date.getTime() - a.date.getTime())

    const notes = newestFirst(notesPrefix)

    if (options.section === "bed") {
      // One plant for each of the most recently tended notes, newest first.
      return (
        <nav class={`home-bed ${displayClass ?? ""}`} aria-label="Recently tended notes">
          {notes.slice(0, options.plants).map(({ f, date }) => {
            const plant = drawPlant({ seed: f.slug as string, ...noteStats(f, allFiles) })
            return (
              <a
                href={href(f.slug!)}
                title={`${title(f)} · ${month(date)}`}
                aria-label={title(f)}
                style={`aspect-ratio:${plant.width}/${plant.height};height:${Math.round((plant.height / 280) * 100)}%`}
                dangerouslySetInnerHTML={{ __html: plant.svg }}
              />
            )
          })}
        </nav>
      )
    }

    const posts = newestFirst(postsPrefix)
    const list = (items: Dated[]) => (
      <ol>
        {items.map(({ f, date }) => (
          <li>
            <a href={href(f.slug!)}>{smallCaps(title(f))}</a>
            <span class="home-dots" />
            <time datetime={date.toISOString()}>{month(date)}</time>
          </li>
        ))}
      </ol>
    )

    return (
      <div class={`home-contents ${displayClass ?? ""}`}>
        {posts.length > 0 && (
          <section>
            <h2>Writing</h2>
            {list(posts)}
          </section>
        )}
        {notes.length > 0 && (
          <section>
            <h2>Lately tended</h2>
            {list(notes.slice(0, options.recentCount))}
            <p>
              <a href={href(`${notesPrefix}index`)}>The index of all {notes.length} notes</a>
            </p>
          </section>
        )}
      </div>
    )
  }

  Home.css = style
  return Home
}) satisfies QuartzComponentConstructor
