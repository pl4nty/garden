import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { getDate, resolveRelative } from "@quartz-community/utils"
import { drawPlant } from "../../../note-plant/src/components/plant"
import { noteStats } from "../../../note-plant/src/components/stats"
import style from "./styles/home.scss"

export interface HomeOptions {
  // "bed" renders the row of plants (place it in beforeBody); "contents"
  // renders the list of posts that follows the page content (place it in
  // afterBody); "revisions" renders the latest changes to notes (place it in
  // right: a drawing keeps its revision history in the top right corner).
  section: "bed" | "contents" | "revisions"
  // Folder slug that holds the posts.
  postsFolder: string
  // Folder slug that holds the notes.
  notesFolder: string
  // Bed: the number of plants. The most recently tended notes get one each.
  plants: number
  // Revisions: the number of rows.
  recentCount: number
}

const defaultOptions: HomeOptions = {
  section: "contents",
  postsFolder: "posts",
  notesFolder: "notes",
  plants: 22,
  recentCount: 8,
}

type Slug = Parameters<typeof resolveRelative>[0]
type Dated = { f: QuartzPluginData; date: Date }

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

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

    const cfgDateType = (cfg as Record<string, unknown>).defaultDateType as string | undefined
    const dateOf = (f: QuartzPluginData) => {
      const data = { ...f, defaultDateType: f.defaultDateType ?? cfgDateType } as QuartzPluginData
      return data.defaultDateType ? getDate(data) : undefined
    }
    const href = (slug: string) => resolveRelative(fileData.slug as Slug, slug as Slug)
    const title = (f: QuartzPluginData) => (f.frontmatter?.title ?? f.slug ?? "") as string
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
                title={`${title(f)}, ${isoDate(date)}`}
                aria-label={title(f)}
                style={`aspect-ratio:${plant.width}/${plant.height};height:${Math.round((plant.height / 280) * 100)}%`}
                dangerouslySetInnerHTML={{ __html: plant.svg }}
              />
            )
          })}
        </nav>
      )
    }

    if (options.section === "revisions") {
      if (notes.length === 0) return null
      // the folder of a note, as its path below the notes folder: "Microsoft / Intune"
      const folderOf = (f: QuartzPluginData) =>
        ((f.relativePath ?? "") as string).split("/").slice(1, -1).join(" / ")
      const shown = notes.slice(0, options.recentCount)
      return (
        <section class={`home-revisions ${displayClass ?? ""}`}>
          <h2>Revision history</h2>
          <table class="bom">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Note</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(({ f, date }) => (
                <tr>
                  <td class="date">
                    <time datetime={date.toISOString()}>{isoDate(date)}</time>
                  </td>
                  <td>
                    <a href={href(f.slug!)}>{title(f)}</a>
                    <span class="folder">{folderOf(f)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            The last {shown.length} changes. <a href={href(`${notesPrefix}index`)}>All notes</a> are
            in the index: there are {notes.length}.
          </p>
        </section>
      )
    }

    const posts = newestFirst(postsPrefix)

    return (
      <div class={`home-contents ${displayClass ?? ""}`}>
        {posts.length > 0 && (
          <section>
            <h2>
              <a href={href(`${postsPrefix}index`)}>Posts</a>
            </h2>
            <table class="bom">
              <thead>
                <tr>
                  <th scope="col" class="num">
                    Item
                  </th>
                  <th scope="col">Title</th>
                  <th scope="col">Date</th>
                  <th scope="col" class="num">
                    Words
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map(({ f, date }, i) => (
                  <tr>
                    <td class="num ref">{posts.length - i}</td>
                    <td>
                      <a href={href(f.slug!)}>{title(f)}</a>
                    </td>
                    <td class="date">
                      <time datetime={date.toISOString()}>{isoDate(date)}</time>
                    </td>
                    <td class="num">{noteStats(f, allFiles).words.toLocaleString("en")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    )
  }

  Home.css = style
  return Home
}) satisfies QuartzComponentConstructor
