import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { getDate, resolveRelative } from "@quartz-community/utils"
import { FOOT, drawPlant, plantSvg, speciesOf } from "../../../note-plant/src/components/plant"
import { noteStats } from "../../../note-plant/src/components/stats"
import { BEDS, bedOf, labelSpot, scatter } from "./scene"
import type { Bed, Spot } from "./scene"
import style from "./styles/home.scss"

export interface HomeOptions {
  // "scene" renders the garden (place it in beforeBody); "index" renders the
  // lists of posts and notes that follow the page content (place it in
  // afterBody).
  section: "scene" | "index"
  // Folder slug that holds the posts.
  postsFolder: string
  // Folder slug that holds the notes.
  notesFolder: string
}

const defaultOptions: HomeOptions = {
  section: "index",
  postsFolder: "posts",
  notesFolder: "notes",
}

type Slug = Parameters<typeof resolveRelative>[0]
type Dated = { f: QuartzPluginData; date: Date }

// a fixed scatter of stars for the night sky: x, y in a 1000 by 400 box, radius
const STARS = Array.from({ length: 70 }, (_, i) => {
  const a = Math.sin(i * 127.1 + 3.3) * 43758.5453
  const b = Math.sin(i * 269.5 + 1.7) * 24634.6345
  const c = Math.sin(i * 419.2 + 7.1) * 13758.1234
  const [x, y, r] = [a - Math.floor(a), b - Math.floor(b), c - Math.floor(c)]
  return `<circle cx="${Math.round(x * 1000)}" cy="${Math.round(y * y * 380)}" r="${(0.5 + r * r * 1.1).toFixed(1)}" opacity="${(0.35 + r * 0.65).toFixed(2)}"/>`
}).join("")

// the far hedge: an uneven skyline along the horizon, in a 1440 by 60 box
const HEDGE = (() => {
  let d = "M0 60"
  for (let x = 0; x <= 1440; x += 30) {
    const y =
      30 - Math.sin(x * 0.011 + 1) * 9 - Math.sin(x * 0.037 + 2) * 6 - Math.sin(x * 0.083) * 3
    d += `L${x} ${Math.round(y)}`
  }
  return `<path d="${d}V60z"/>`
})()

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
    const day = (d: Date) =>
      d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
    const newestFirst = (prefix: string): Dated[] =>
      allFiles
        .filter((f) => f.slug?.startsWith(prefix) && !f.slug.endsWith("/index"))
        .map((f) => ({ f, date: dateOf(f) }))
        .filter((n): n is Dated => Boolean(n.date))
        .sort((a, b) => b.date.getTime() - a.date.getTime())

    const notes = newestFirst(notesPrefix)
    const posts = newestFirst(postsPrefix)

    if (options.section === "scene") {
      const all = [...posts, ...notes]
      const lastTended = all.reduce((latest, n) => (n.date > latest ? n.date : latest), new Date(0))

      // Each bed's notes, newest first, take the bed's places in turn: the
      // places run from the middle of the bed outward.
      const beds = new Map<Bed, Dated[]>()
      for (const n of all) {
        const bed = bedOf(n.f.slug as string)
        if (bed) beds.set(bed, [...(beds.get(bed) ?? []), n])
      }

      let id = 0
      const place = (wide: Spot, tall?: Spot) => {
        const r = (v: number) => Math.round(v * 100) / 100
        let out = `--x1:${r(wide.x)};--y1:${r(wide.y)};--s1:${r(wide.s)};--d1:${r(wide.z)}`
        if (tall) out += `;--x2:${r(tall.x)};--y2:${r(tall.y)};--s2:${r(tall.s)};--d2:${r(tall.z)}`
        return out
      }

      const garden = BEDS.flatMap((bed, b) => {
        const grown = beds.get(bed) ?? []
        if (grown.length === 0) return []
        const wide = scatter(bed.wide, grown.length, b * 1.7 + 0.4)
        const kept = Math.min(bed.keep, grown.length)
        const tall = scatter(bed.tall, kept, b * 1.7 + 0.4, true)
        const plants = grown
          .map(({ f, date }, i) => {
            const slug = f.slug as string
            const plant = drawPlant({
              seed: slug,
              ...noteStats(f, allFiles),
              species: speciesOf(slug),
            })
            const spot = wide[i]!
            const edge = spot.x < 12 ? " plant-left" : spot.x > 88 ? " plant-right" : ""
            return {
              x: spot.x,
              el: (
                <a
                  class={`plant${i < kept ? "" : " plant-wide"}${edge}`}
                  href={href(slug)}
                  aria-label={`${title(f)}, tended ${day(date)}`}
                  style={`--w:${plant.halfWidth * 2};--h:${plant.height + FOOT};${place(spot, tall[i])}`}
                >
                  <span
                    class="plant-art plant-box"
                    dangerouslySetInnerHTML={{ __html: plantSvg(plant, `p${id++}`) }}
                  />
                  <span class="plant-tag" aria-hidden="true">
                    <b>{title(f)}</b>
                    <span>tended {day(date)}</span>
                  </span>
                </a>
              ),
            }
          })
          // left to right, the order a keyboard visits them in
          .sort((p, q) => p.x - q.x)
          .map((p) => p.el)
        return [
          ...plants,
          <a
            class="bed-label"
            href={href(`${bed.href}index`)}
            style={place(labelSpot(bed.wide), labelSpot(bed.tall, true))}
          >
            {bed.label}
          </a>,
        ]
      })

      return (
        <div class={`scene ${displayClass ?? ""}`}>
          <div class="scene-sky" />
          <svg
            class="scene-stars"
            viewBox="0 0 1000 400"
            preserveAspectRatio="xMidYMin slice"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: STARS }}
          />
          <svg
            class="scene-far"
            viewBox="0 0 1440 60"
            preserveAspectRatio="none"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: HEDGE }}
          />
          <div class="scene-ground" />
          <nav class="scene-plants" aria-label="The garden: a plant for each note and post">
            <a class="scene-skip" href="#index">
              Skip the garden
            </a>
            {garden}
          </nav>
          <div class="scene-fireflies" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div class="scene-grain" />
          <div class="scene-foot" />
          <p class="scene-count">
            {notes.length} notes · {posts.length} posts · last tended{" "}
            <time datetime={lastTended.toISOString()}>{day(lastTended)}</time>
          </p>
          <p class="scene-time">
            <span data-light-name>midday</span> <span data-light-clock />
          </p>
        </div>
      )
    }

    // Posts, newest first, under the year of each.
    const years = new Map<number, Dated[]>()
    for (const post of posts) {
      const year = post.date.getFullYear()
      years.set(year, [...(years.get(year) ?? []), post])
    }

    // Notes, under the folder of each. A folder is named by its path below
    // the notes folder, as written on disk ("Microsoft / Windows").
    const depth = notesPrefix.split("/").length - 1
    const folders = new Map<string, { names: string[]; notes: Dated[] }>()
    for (const note of notes) {
      const folder = (note.f.slug as string).split("/").slice(0, -1).join("/")
      const names = ((note.f.relativePath ?? "") as string).split("/").slice(depth, -1)
      const group = folders.get(folder) ?? { names, notes: [] }
      group.notes.push(note)
      folders.set(folder, group)
    }
    const root = notesPrefix.slice(0, -1)
    const sorted = [...folders.entries()].sort(([a], [b]) => {
      // notes that sit directly in the notes folder go last
      if (a === root) return 1
      if (b === root) return -1
      return a.localeCompare(b)
    })

    return (
      <div class={`home-index ${displayClass ?? ""}`} id="index">
        {posts.length > 0 && (
          <section>
            <h2>
              <a href={href(`${postsPrefix}index`)}>Posts</a>
            </h2>
            {[...years.entries()].map(([year, items]) => (
              <div class="home-row home-year">
                <h3>{year}</h3>
                <ol>
                  {items.map(({ f, date }) => (
                    <li>
                      <a href={href(f.slug!)}>{title(f)}</a>
                      <time datetime={date.toISOString()}>
                        {date.toLocaleDateString(locale, { day: "numeric", month: "short" })}
                      </time>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </section>
        )}
        {notes.length > 0 && (
          <section>
            <h2>
              <a href={href(`${notesPrefix}index`)}>Notes</a>
            </h2>
            {sorted.map(([folder, group]) => (
              <div class="home-row">
                <h3>
                  {folder === root ? (
                    "Loose"
                  ) : (
                    <a href={href(`${folder}/index`)}>{group.names.join(" / ")}</a>
                  )}
                </h3>
                <ul>
                  {group.notes
                    .sort((a, b) =>
                      title(a.f).localeCompare(title(b.f), locale, {
                        numeric: true,
                        sensitivity: "base",
                      }),
                    )
                    .map(({ f }) => (
                      <li>
                        <a href={href(f.slug!)}>{title(f)}</a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </section>
        )}
        <p class="home-legend">
          Each plant in the garden is one of these. It grows taller as the note gets longer, puts
          out leaves for the notes it links to, and flowers when another note links back. Posts
          always flower. The light is your local time.
        </p>
      </div>
    )
  }

  Home.css = style
  return Home
}) satisfies QuartzComponentConstructor
