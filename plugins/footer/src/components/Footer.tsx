import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { getDate } from "@quartz-community/utils"
import { revisions } from "./revisions"
import style from "./styles/footer.scss"

export interface FooterOptions {
  // The name of the site, beside the mark.
  site: string
  // Who the sheets are drawn by.
  drawnBy: string
  // The repository and branch that hold the content, for the link from a
  // page's revision to its history.
  repository: string
  branch: string
  // The licence of the content, and the page that states it.
  licence?: { label: string; href: string }
}

const defaultOptions: FooterOptions = {
  site: "",
  drawnBy: "",
  repository: "",
  branch: "main",
}

// Zones of the frame, as on an A4 sheet in KiCad: six across, four down.
const COLUMNS = ["1", "2", "3", "4", "5", "6"]
const ROWS = ["A", "B", "C", "D"]

// The site's mark: a sprout wired to an earth symbol.
export const mark =
  '<svg class="mark" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke-linecap="square" aria-hidden="true">' +
  '<g class="mark-plant" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 15.5V6"/>' +
  '<path fill="currentColor" d="M12 11.5Q7.2 12.3 4.5 6.5Q10.6 6.4 12 11.5Z"/>' +
  '<path fill="currentColor" d="M12 8Q11.6 3.6 18.5 1.5Q18.8 6.6 12 8Z"/></g>' +
  '<g class="mark-earth" stroke="currentColor" stroke-width="1.5"><path d="M5 16.25h14M8 19.5h8M10.75 22.75h2.5"/></g></svg>'

const words = (text: string) => text.split(/\s+/).filter(Boolean).length
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

// The sheet: a drawing frame around the viewport, with zone markers along its
// edges, and the title block in its bottom right corner. The title block is
// filled in from the page, and stands in for the usual line of date and
// reading time under a page's title.
export default ((opts?: Partial<FooterOptions>) => {
  const options: FooterOptions = { ...defaultOptions, ...opts }
  const repository = options.repository.replace(/\/$/, "")

  const Footer: QuartzComponent = ({
    fileData,
    allFiles,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    const slug = (fileData.slug ?? "") as string
    const folder = slug === "index" ? undefined : slug.match(/^(.*)\/index$/)?.[1]
    const title = (fileData.frontmatter?.title ?? "") as string

    // the path of the sheet, as KiCad writes a sheet path: "/" is the root
    const sheet = slug === "index" ? "/" : folder !== undefined ? `/${folder}/` : `/${slug}`

    const cfgDateType = (cfg as Record<string, unknown>).defaultDateType as string | undefined
    const dateOf = (f: QuartzPluginData) => {
      const data = { ...f, defaultDateType: f.defaultDateType ?? cfgDateType } as QuartzPluginData
      return data.defaultDateType && data.dates ? getDate(data) : undefined
    }

    // A folder's size is the number of sheets below it, and its date is that
    // of the newest of them. A page's size is its length.
    const below =
      folder === undefined
        ? []
        : allFiles.filter((f) => {
            const s = (f.slug ?? "") as string
            return s.startsWith(`${folder}/`) && !s.endsWith("/index")
          })
    // Only a page that comes from a file has a length and a history.
    const filePath = fileData.filePath as string | undefined
    const fromFile = Boolean(filePath?.endsWith(".md") && fileData.text !== undefined)
    const count = fromFile ? words((fileData.text ?? "") as string) : 0
    const size =
      below.length > 0
        ? `${below.length} ${below.length === 1 ? "sheet" : "sheets"}`
        : count > 0
          ? `${count.toLocaleString("en")} ${count === 1 ? "word" : "words"}`
          : undefined
    const date =
      below.length > 0
        ? below
            .map(dateOf)
            .filter((d): d is Date => Boolean(d))
            .sort((a, b) => b.getTime() - a.getTime())[0]
        : dateOf(fileData)

    const revision = fromFile ? revisions(filePath!.split("/")[0]!).get(filePath!) : undefined
    const history =
      fromFile && repository
        ? `${repository}/commits/${options.branch}/${filePath!.split("/").map(encodeURIComponent).join("/")}`
        : undefined

    return (
      <footer class={`sheet ${displayClass ?? ""}`}>
        <div class="sheet-frame" aria-hidden="true">
          {(["top", "bottom"] as const).map((edge) => (
            <div class={`sheet-zones ${edge}`}>
              {COLUMNS.map((zone) => (
                <span>{zone}</span>
              ))}
            </div>
          ))}
          {(["left", "right"] as const).map((edge) => (
            <div class={`sheet-zones ${edge}`}>
              {ROWS.map((zone) => (
                <span>{zone}</span>
              ))}
            </div>
          ))}
        </div>
        <dl class="title-block" aria-label="Title block">
          <div class="tb-site">
            <dt>Site</dt>
            <dd>
              <span dangerouslySetInnerHTML={{ __html: mark }} />
              {options.site}
            </dd>
          </div>
          <div class="tb-sheet">
            <dt>Sheet</dt>
            <dd>{sheet}</dd>
          </div>
          <div class="tb-title">
            <dt>Title</dt>
            <dd>{title}</dd>
          </div>
          <div class="tb-date">
            <dt>Date</dt>
            <dd>{date ? <time datetime={date.toISOString()}>{isoDate(date)}</time> : "–"}</dd>
          </div>
          <div class="tb-size">
            <dt>Size</dt>
            <dd>{size ?? "–"}</dd>
          </div>
          <div class="tb-rev">
            <dt>Rev</dt>
            <dd>
              {history ? (
                <a
                  href={history}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={
                    revision ? `Revision ${revision}: history on GitHub` : "History on GitHub"
                  }
                >
                  {revision ?? "history"}
                </a>
              ) : (
                "–"
              )}
            </dd>
          </div>
          <div class="tb-drawn">
            <dt>Drawn by</dt>
            <dd>{options.drawnBy}</dd>
          </div>
          {options.licence && (
            <div class="tb-licence">
              <dt>Licence</dt>
              <dd>
                <a href={options.licence.href}>{options.licence.label}</a>
              </dd>
            </div>
          )}
          <div class="tb-tool">
            <dt>Tools</dt>
            <dd>
              <a href="https://obsidian.md/">Obsidian</a>,{" "}
              <a href="https://quartz.jzhao.xyz/">Quartz</a>
            </dd>
          </div>
        </dl>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
