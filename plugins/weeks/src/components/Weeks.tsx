import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { getDate, resolveRelative } from "@quartz-community/utils"
import style from "./styles/weeks.scss"

export interface WeeksOptions {
  // Slug of the note that holds the page.
  slug: string
  // First week of the grid, as YYYY-MM-DD. Empty starts at the earliest event.
  // With a date here, each birthday week shows the age.
  born: string
  // Folder slug whose notes are added as events at their own dates. Empty
  // adds none.
  postsFolder: string
}

const defaultOptions: WeeksOptions = {
  slug: "weeks",
  born: "",
  postsFolder: "posts",
}

type Slug = Parameters<typeof resolveRelative>[0]

interface HastNode {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

interface Event {
  date: Date
  label: string
  href?: string
  era?: number
}

interface Era {
  name: string
  from: Date
}

const WEEK = 7 * 24 * 60 * 60 * 1000
const ERA_COLOURS = 5

// "2021", "2021-03" or "2021-03-08" at the start of a list item, then the label
const DATED = /^\s*(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?\s*[:–—-]?\s+(.+)$/s

const text = (node: HastNode): string =>
  node.type === "text" ? (node.value ?? "") : (node.children ?? []).map(text).join("")

const firstLink = (node: HastNode): string | undefined => {
  if (node.tagName === "a") return node.properties?.href as string | undefined
  for (const child of node.children ?? []) {
    const href = firstLink(child)
    if (href) return href
  }
  return undefined
}

// Read the note: each `## heading` starts an era, and each list item that
// starts with a date is an event in the era above it.
function readNote(tree: HastNode) {
  const events: Event[] = []
  const eras: Era[] = []
  let era: number | undefined
  let pending: string | undefined

  const walk = (node: HastNode) => {
    if (node.tagName === "h2") {
      pending = text(node).trim()
      return
    }
    if (node.tagName === "li") {
      // the item's own text, without any nested list
      const own = { ...node, children: (node.children ?? []).filter((c) => c.tagName !== "ul") }
      const match = DATED.exec(text(own))
      if (match) {
        const [, y, m, d, label] = match
        const date = new Date(Date.UTC(Number(y), Number(m ?? 1) - 1, Number(d ?? 1)))
        if (pending !== undefined) {
          era = eras.push({ name: pending, from: date }) - 1
          pending = undefined
        }
        events.push({ date, label: label!.trim(), href: firstLink(own), era })
      }
    }
    for (const child of node.children ?? []) walk(child)
  }
  walk(tree)
  return { events, eras }
}

export default ((opts?: Partial<WeeksOptions>) => {
  const options: WeeksOptions = { ...defaultOptions, ...opts }
  const postsPrefix = options.postsFolder ? `${options.postsFolder.replace(/\/$/, "")}/` : undefined

  const Weeks: QuartzComponent = ({
    fileData,
    allFiles,
    tree,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    if (fileData.slug !== options.slug) return null

    const locale = cfg.locale || "en-US"
    const { events, eras } = readNote(tree as HastNode)

    if (postsPrefix) {
      const cfgDateType = (cfg as Record<string, unknown>).defaultDateType as string | undefined
      for (const f of allFiles) {
        const slug = f.slug as string | undefined
        if (!slug || !slug.startsWith(postsPrefix) || slug.endsWith("/index")) continue
        const data = { ...f, defaultDateType: f.defaultDateType ?? cfgDateType } as QuartzPluginData
        const date = data.defaultDateType ? getDate(data) : undefined
        if (!date) continue
        events.push({
          date,
          label: `Wrote “${f.frontmatter?.title ?? slug}”`,
          href: resolveRelative(fileData.slug as Slug, slug as Slug),
        })
      }
    }
    if (events.length === 0 && !options.born) return null
    events.sort((a, b) => a.date.getTime() - b.date.getTime())

    const born = options.born ? new Date(`${options.born}T00:00:00Z`) : undefined
    const start = born ?? events[0]!.date
    const now = new Date()
    const total = Math.max(1, Math.floor((now.getTime() - start.getTime()) / WEEK) + 1)
    const weekOf = (date: Date) => Math.floor((date.getTime() - start.getTime()) / WEEK)

    // what each week holds
    const byWeek = new Map<number, Event[]>()
    for (const event of events) {
      const week = weekOf(event.date)
      if (week < 0 || week >= total) continue
      byWeek.set(week, [...(byWeek.get(week) ?? []), event])
    }
    // markers: the age on each birthday, or the year on each new year
    const markers = new Map<number, string>()
    if (born) {
      for (let age = 1; ; age++) {
        const day = new Date(born)
        day.setUTCFullYear(born.getUTCFullYear() + age)
        if (day > now) break
        markers.set(weekOf(day), String(age))
      }
    } else {
      for (let year = start.getUTCFullYear() + 1; year <= now.getUTCFullYear(); year++) {
        markers.set(weekOf(new Date(Date.UTC(year, 0, 1))), String(year))
      }
    }
    const eraAt = (week: number) => {
      let current: number | undefined
      eras.forEach((era, i) => {
        if (weekOf(era.from) <= week) current = i
      })
      return current
    }

    const day = (date: Date) =>
      date.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    const month = (date: Date) =>
      date.toLocaleDateString(locale, { month: "short", year: "numeric", timeZone: "UTC" })

    const cells = []
    for (let week = 0; week < total; week++) {
      const era = eraAt(week)
      const eraClass = era === undefined ? "" : ` era-${era % ERA_COLOURS}`
      const first = new Date(start.getTime() + week * WEEK)
      const title = `Week of ${day(first)}${era === undefined ? "" : ` · ${eras[era]!.name}`}`
      const here = week === total - 1 ? " now" : ""
      const held = byWeek.get(week)
      if (held) {
        for (const event of held) {
          const label = <span>{event.label}</span>
          cells.push(
            event.href ? (
              <a class={`wk ev${eraClass}${here}`} href={event.href} title={title}>
                {label}
              </a>
            ) : (
              <span class={`wk ev${eraClass}${here}`} title={title}>
                {label}
              </span>
            ),
          )
        }
      } else if (markers.has(week)) {
        cells.push(
          <span class={`wk mark${eraClass}${here}`} title={title} aria-hidden="true">
            {markers.get(week)}
          </span>,
        )
      } else {
        cells.push(<span class={`wk${eraClass}${here}`} title={title} aria-hidden="true" />)
      }
    }

    return (
      <section class={`weeks ${displayClass ?? ""}`}>
        <p class="weeks-count">
          {total.toLocaleString("en")} weeks since {month(start)}
          {events.length > 0 && ` · ${events.length} marked`}
        </p>
        {eras.length > 0 && (
          <ul class="weeks-eras">
            {eras.map((era, i) => (
              <li>
                <span class={`wk era-${i % ERA_COLOURS}`} aria-hidden="true" />
                {era.name}
                <span class="weeks-era-from">from {month(era.from)}</span>
              </li>
            ))}
          </ul>
        )}
        <div class="weeks-grid" role="group" aria-label="One box for each week, oldest first">
          {cells}
        </div>
        {events.length > 0 && (
          <details class="weeks-list">
            <summary>The same weeks as a list</summary>
            <ol>
              {events.map((event) => (
                <li>
                  <time datetime={event.date.toISOString().slice(0, 10)}>{day(event.date)}</time>
                  {event.href ? <a href={event.href}>{event.label}</a> : <span>{event.label}</span>}
                </li>
              ))}
            </ol>
          </details>
        )}
      </section>
    )
  }

  Weeks.css = style
  return Weeks
}) satisfies QuartzComponentConstructor
