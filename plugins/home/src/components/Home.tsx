import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { getDate, resolveRelative } from "@quartz-community/utils"
import { vine } from "./vine"
import style from "./styles/home.scss"

export interface HomeOptions {
  // "hero" renders the heading block (place it in beforeBody); "sections"
  // renders the lists that follow the page content (place it in afterBody).
  section: "hero" | "sections"
  // Small line above the heading.
  eyebrow: string
  // Page heading. Text between asterisks is set in italics.
  heading: string
  // Label -> URL, shown as a row of links below the page content.
  links: Record<string, string>
  // Ordered post slugs to feature, for example "posts/my-post".
  featured: string[]
  // Folder slug that holds the posts.
  postsFolder: string
  // Folder slug that holds the notes.
  notesFolder: string
  // Number of recently modified notes to list.
  recentCount: number
}

const defaultOptions: HomeOptions = {
  section: "sections",
  eyebrow: "",
  heading: "",
  links: {},
  featured: [],
  postsFolder: "posts",
  notesFolder: "notes",
  recentCount: 6,
}

type Slug = Parameters<typeof resolveRelative>[0]

const isIndex = (slug: string) => slug === "index" || slug.endsWith("/index")

// "Notes/Microsoft/Intune/Win32 Apps.md" -> ["Notes", "Microsoft", "Intune"]
const folderNames = (f: QuartzPluginData) =>
  ((f.relativePath ?? "") as string).split("/").slice(0, -1)

function emphasise(text: string) {
  return text.split("*").map((part, i) => (i % 2 === 1 ? <em>{part}</em> : part))
}

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

    if (options.section === "hero") {
      return (
        <header class={`home-hero ${displayClass ?? ""}`}>
          <div class="home-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: vine }} />
          {options.eyebrow && <p class="home-eyebrow">{options.eyebrow}</p>}
          <h1 class="home-heading">
            {emphasise(options.heading || fileData.frontmatter?.title || "")}
          </h1>
        </header>
      )
    }

    const locale = cfg.locale || "en-US"
    const cfgDateType = (cfg as Record<string, unknown>).defaultDateType as string | undefined
    const dateOf = (f: QuartzPluginData) => {
      const data = {
        ...f,
        defaultDateType: f.defaultDateType ?? cfgDateType,
      } as QuartzPluginData
      return data.defaultDateType ? getDate(data) : undefined
    }
    const href = (slug: string) => resolveRelative(fileData.slug as Slug, slug as Slug)
    const title = (f: QuartzPluginData) => f.frontmatter?.title ?? f.slug
    const shortDate = (d: Date) => d.toLocaleDateString(locale, { month: "short", year: "numeric" })

    const pages = allFiles.filter((f) => f.slug && !isIndex(f.slug))
    const posts = pages.filter((f) => f.slug!.startsWith(postsPrefix))
    const notes = pages.filter((f) => f.slug!.startsWith(notesPrefix))

    const bySlug = new Map(allFiles.map((f) => [f.slug as string, f]))
    const featured = options.featured
      .map((slug) => bySlug.get(slug))
      .filter((f): f is QuartzPluginData => Boolean(f))

    const recent = notes
      .map((f) => ({ f, date: dateOf(f) }))
      .filter((n): n is { f: QuartzPluginData; date: Date } => Boolean(n.date))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, options.recentCount)

    // One column for each folder directly below the notes folder. A column
    // lists the folder's children: subfolders (name -> folder page) and the
    // notes that sit directly in it (title -> note).
    type Child = { slug: string; folder: boolean }
    const topics = new Map<string, { name: string; count: number; children: Map<string, Child> }>()
    for (const f of notes) {
      const segments = f.slug!.split("/")
      const names = folderNames(f)
      if (segments.length < 3 || names.length < 2) continue
      const key = segments[1]!
      const topic = topics.get(key) ?? {
        name: names[1]!,
        count: 0,
        children: new Map<string, Child>(),
      }
      topic.count++
      if (names[2]) {
        topic.children.set(names[2], {
          slug: `${segments.slice(0, 3).join("/")}/index`,
          folder: true,
        })
      } else {
        topic.children.set(title(f)!, { slug: f.slug!, folder: false })
      }
      topics.set(key, topic)
    }

    // "https://github.com/pl4nty" -> "github.com/pl4nty"
    const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")

    const links = Object.entries(options.links)

    return (
      <div class={`home-sections ${displayClass ?? ""}`}>
        {links.length > 0 && (
          <dl class="home-contact">
            {links.map(([label, url]) => {
              const external = /^https?:\/\//.test(url)
              return (
                <div>
                  <dt>{label.toLowerCase()}</dt>
                  <dd>
                    <a
                      href={url}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                    >
                      {bare(url)}
                    </a>
                  </dd>
                </div>
              )
            })}
          </dl>
        )}

        <div class="home-columns">
          {featured.length > 0 && (
            <section class="home-section home-writing">
              <header>
                <h2>Writing</h2>
                <a href={href(`${postsPrefix}index`)}>All {posts.length} posts →</a>
              </header>
              <ol>
                {featured.map((f) => {
                  const date = dateOf(f)
                  return (
                    <li>
                      <a href={href(f.slug!)} class="home-card">
                        {date && (
                          <time datetime={date.toISOString()}>{String(date.getFullYear())}</time>
                        )}
                        <h3>{title(f)}</h3>
                        {f.description && <p>{f.description}</p>}
                      </a>
                    </li>
                  )
                })}
              </ol>
            </section>
          )}

          {recent.length > 0 && (
            <section class="home-section home-tended">
              <header>
                <h2>Recently tended</h2>
                <a href={href(`${notesPrefix}index`)}>All {notes.length} notes →</a>
              </header>
              <ul>
                {recent.map(({ f, date }) => (
                  <li>
                    <a href={href(f.slug!)}>
                      <span class="home-note-title">{title(f)}</span>
                      <span class="home-note-meta">
                        <span>{folderNames(f).slice(1).join(" / ")}</span>
                        <time datetime={date.toISOString()}>{shortDate(date)}</time>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {topics.size > 0 && (
          <section class="home-section home-topics">
            <header>
              <h2>Explore the notes</h2>
            </header>
            <div class="home-index">
              {[...topics.entries()]
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([key, topic]) => (
                  <div>
                    <h3>
                      <a href={href(`${notesPrefix}${key}/index`)}>{topic.name}</a>
                      <span>{topic.count}</span>
                    </h3>
                    <ul>
                      {[...topic.children.entries()]
                        // folders first, then notes, each by name
                        .sort(
                          ([a, x], [b, y]) =>
                            Number(y.folder) - Number(x.folder) || a.localeCompare(b),
                        )
                        .map(([name, child]) => (
                          <li>
                            <a href={href(child.slug)}>
                              {name}
                              {child.folder && <span aria-hidden="true">/</span>}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  Home.css = style
  return Home
}) satisfies QuartzComponentConstructor
