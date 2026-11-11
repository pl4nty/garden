import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils"
import { Cmd, LsRows, dateOf, titleOf, wordCount } from "../../../shared/listing"
import style from "./styles/home.scss"

export interface HomeOptions {
  // "head" renders the command above the homepage's own text (place it in
  // beforeBody); "listing" renders the listings below it (place it in
  // afterBody).
  section: "head" | "listing"
  // Folder slug that holds the posts.
  postsFolder: string
  // Folder slug that holds the notes.
  notesFolder: string
  // The number of recently tended notes to list.
  recentCount: number
}

const defaultOptions: HomeOptions = {
  section: "listing",
  postsFolder: "posts",
  notesFolder: "notes",
  recentCount: 8,
}

type Slug = Parameters<typeof resolveRelative>[0]
type Dated = { f: QuartzPluginData; date: Date }

export default ((opts?: Partial<HomeOptions>) => {
  const options: HomeOptions = { ...defaultOptions, ...opts }
  const posts = options.postsFolder.replace(/\/$/, "")
  const notes = options.notesFolder.replace(/\/$/, "")

  const Home: QuartzComponent = ({
    fileData,
    allFiles,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    // The component sits in a slot that every content page shares.
    if (fileData.slug !== "index") return null

    if (options.section === "head") {
      // The homepage is a shell session, and its text is the first output.
      return (
        <p class={`cmd ${displayClass ?? ""}`} aria-hidden="true">
          cat ~/index.md
        </p>
      )
    }

    const href = (slug: string) => resolveRelative(fileData.slug as Slug, slug as Slug)
    const newestFirst = (folder: string): Dated[] =>
      allFiles
        .filter((f) => f.slug?.startsWith(`${folder}/`) && !f.slug.endsWith("/index"))
        .map((f) => ({ f, date: dateOf(f, cfg) }))
        .filter((n): n is Dated => Boolean(n.date))
        .sort((a, b) => b.date.getTime() - a.date.getTime())
    const rows = (items: Dated[]) =>
      items.map(({ f, date }) => ({
        href: href(f.slug!),
        title: titleOf(f),
        date,
        words: wordCount(f),
      }))

    const allPosts = newestFirst(posts)
    const allNotes = newestFirst(notes)
    const recent = allNotes.slice(0, options.recentCount)

    return (
      <div class={`home-listing ${displayClass ?? ""}`}>
        {allPosts.length > 0 && (
          <section>
            <Cmd label="Posts, newest first">
              ls -lt <a href={href(`${posts}/index`)}>~/{posts}</a>
            </Cmd>
            <LsRows rows={rows(allPosts)} />
          </section>
        )}
        {recent.length > 0 && (
          <section>
            <Cmd label="Notes, most recently tended first">
              ls -lt <a href={href(`${notes}/index`)}>~/{notes}</a> | head -n {recent.length}
            </Cmd>
            <LsRows rows={rows(recent)} />
            {allNotes.length > recent.length && (
              <p class="home-more">
                {allNotes.length - recent.length} more in{" "}
                <a href={href(`${notes}/index`)}>~/{notes}</a>
              </p>
            )}
          </section>
        )}
      </div>
    )
  }

  Home.css = style
  return Home
}) satisfies QuartzComponentConstructor
