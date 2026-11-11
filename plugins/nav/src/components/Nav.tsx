import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils"
import { dateOf, dayMonthYear, newestFirst, titleOf } from "../../../shared/pages"
import style from "./styles/nav.scss"

export interface NavOptions {
  // "sidebar" is the index of the site that stands beside every page: both
  // lists, then the links. "home" is the two lists alone, for the foot of
  // the homepage on a screen too narrow for the sidebar.
  part: "sidebar" | "home"
  // Label -> slug. A slug that ends in "/" is a folder ("posts/"), and every
  // page below it marks the link as current.
  links: Record<string, string>
  // Slugs of the posts under "Selected writing", in order.
  featured: string[]
  // Folder slugs that hold the posts and the notes.
  postsFolder: string
  notesFolder: string
  // The number of notes under "Recent notes".
  recentCount: number
}

const defaultOptions: NavOptions = {
  part: "sidebar",
  links: {},
  featured: [],
  postsFolder: "posts",
  notesFolder: "notes",
  recentCount: 5,
}

type Slug = Parameters<typeof resolveRelative>[0]

export default ((opts?: Partial<NavOptions>) => {
  const options: NavOptions = { ...defaultOptions, ...opts }
  const links = Object.entries(options.links).map(([label, target]) => {
    const folder = target.endsWith("/")
    const slug = (folder ? `${target}index` : target).toLowerCase()
    return { label, slug, prefix: folder ? target.toLowerCase() : undefined }
  })

  const Nav: QuartzComponent = ({
    fileData,
    allFiles,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    const current = (fileData.slug ?? "") as string
    if (options.part === "home" && current !== "index") return null

    const locale = cfg.locale || "en-US"
    const href = (slug: string) => resolveRelative(current as Slug, slug as Slug)

    const posts = newestFirst(allFiles, cfg, [options.postsFolder])
    const notes = newestFirst(allFiles, cfg, [options.notesFolder])
    const featured = options.featured
      .map((slug) => allFiles.find((f) => f.slug === slug))
      .filter((f): f is QuartzPluginData => f !== undefined)
    const recent = notes.slice(0, options.recentCount).map(({ f }) => f)

    const list = (heading: string, pages: QuartzPluginData[], more: number, folder: string) => (
      <section>
        <h2>{heading}</h2>
        <ul>
          {pages.map((f) => {
            const date = dateOf(f, cfg)
            return (
              <li>
                <a href={href(f.slug!)} aria-current={f.slug === current ? "page" : undefined}>
                  {titleOf(f)}
                </a>
                {date && <time datetime={date.toISOString()}>{dayMonthYear(date, locale)}</time>}
              </li>
            )
          })}
        </ul>
        {more > 0 && (
          <a class="site-index-more" href={href(`${folder.replace(/\/$/, "")}/index`)}>
            See {more} more →
          </a>
        )}
      </section>
    )

    const lists = (
      <>
        {featured.length > 0 &&
          list("Selected writing", featured, posts.length - featured.length, options.postsFolder)}
        {recent.length > 0 &&
          list("Recent notes", recent, notes.length - recent.length, options.notesFolder)}
      </>
    )

    if (options.part === "home") {
      return <div class={`site-index site-index-home ${displayClass ?? ""}`}>{lists}</div>
    }

    return (
      <nav class={`site-index ${displayClass ?? ""}`} aria-label="Site">
        {lists}
        <ul class="site-links">
          {links.map(({ label, slug, prefix }) => {
            const inside = prefix !== undefined && current.startsWith(prefix)
            return (
              <li>
                <a
                  href={href(slug)}
                  class={current === slug || inside ? "active" : undefined}
                  aria-current={current === slug ? "page" : undefined}
                >
                  {label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  Nav.css = style
  return Nav
}) satisfies QuartzComponentConstructor
