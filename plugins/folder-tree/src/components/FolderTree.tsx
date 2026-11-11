import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { getDate, resolveRelative } from "@quartz-community/utils"
import style from "./styles/folderTree.scss"

export interface FolderTreeOptions {
  // Folder slugs to render a list for. The list shows on the index page of
  // each root and of every folder below it.
  roots: string[]
  // Roots whose pages are listed newest first. The others are listed by title.
  newestFirst: string[]
}

const defaultOptions: FolderTreeOptions = {
  roots: ["notes"],
  newestFirst: [],
}

type Slug = Parameters<typeof resolveRelative>[0]
type Entry = { f: QuartzPluginData; date?: Date; words: number }

interface Group {
  // slug of the folder, without a trailing slash
  folder: string
  // display names of the folder, relative to the page's folder
  names: string[]
  entries: Entry[]
}

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

// The index of a folder as a parts list: one ruled table of every page below
// the folder, grouped by subfolder, with the date and the length of each.
export default ((opts?: Partial<FolderTreeOptions>) => {
  const options: FolderTreeOptions = { ...defaultOptions, ...opts }
  const clean = (r: string) => r.replace(/\/$/, "").toLowerCase()
  const roots = options.roots.map(clean)
  const newestFirst = options.newestFirst.map(clean)

  const FolderTree: QuartzComponent = ({
    fileData,
    allFiles,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    const slug = (fileData.slug ?? "") as string
    if (!slug.endsWith("/index")) return null
    const here = slug.slice(0, -"/index".length)
    const root = roots.find((r) => here === r || here.startsWith(`${r}/`))
    if (root === undefined) return null
    const byDate = newestFirst.includes(root)

    const locale = cfg.locale || "en-US"
    const cfgDateType = (cfg as Record<string, unknown>).defaultDateType as string | undefined
    const dateOf = (f: QuartzPluginData) => {
      const data = {
        ...f,
        defaultDateType: f.defaultDateType ?? cfgDateType,
      } as QuartzPluginData
      return data.defaultDateType ? getDate(data) : undefined
    }
    const titleOf = (f: QuartzPluginData) => (f.frontmatter?.title ?? f.slug ?? "") as string
    const depth = here.split("/").length

    const groups = new Map<string, Group>()
    for (const f of allFiles) {
      const s = f.slug as string | undefined
      if (!s || !s.startsWith(`${here}/`) || s.endsWith("/index")) continue
      const folder = s.split("/").slice(0, -1).join("/")
      const names = ((f.relativePath ?? "") as string).split("/").slice(depth, -1)
      const group = groups.get(folder) ?? { folder, names, entries: [] }
      const words = ((f.text ?? "") as string).split(/\s+/).filter(Boolean).length
      group.entries.push({ f, date: dateOf(f), words })
      groups.set(folder, group)
    }
    if (groups.size === 0) return null

    // Pages that sit directly in this folder go last, below the subfolders.
    const sorted = [...groups.values()].sort((a, b) => {
      if (a.folder === here) return 1
      if (b.folder === here) return -1
      return a.folder.localeCompare(b.folder)
    })
    for (const group of sorted) {
      group.entries.sort((a, b) =>
        byDate
          ? (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)
          : titleOf(a.f).localeCompare(titleOf(b.f), locale, {
              numeric: true,
              sensitivity: "base",
            }),
      )
    }
    const total = sorted.reduce((n, g) => n + g.entries.length, 0)
    const hasSubfolders = sorted.some((g) => g.folder !== here)

    // Items are numbered through the whole table. A list that is newest first
    // counts down, so an item keeps its number when a newer one is added.
    let item = 0
    const number = () => (byDate ? total - item++ : ++item)

    return (
      <section class={`folder-tree ${displayClass ?? ""}`}>
        <table class="bom">
          <thead>
            <tr>
              <th scope="col" class="num">
                Item
              </th>
              <th scope="col">Title</th>
              <th scope="col">{byDate ? "Date" : "Updated"}</th>
              <th scope="col" class="num">
                Words
              </th>
            </tr>
          </thead>
          {sorted.map((group) => (
            <tbody>
              {hasSubfolders && (
                <tr class="bom-group">
                  <th colSpan={4} scope="rowgroup">
                    {group.folder === here ? (
                      "Loose sheets"
                    ) : (
                      <a href={resolveRelative(slug as Slug, `${group.folder}/index` as Slug)}>
                        {group.names.join(" / ")}
                      </a>
                    )}
                    <span class="bom-count">{group.entries.length}</span>
                  </th>
                </tr>
              )}
              {group.entries.map(({ f, date, words }) => (
                <tr>
                  <td class="num ref">{number()}</td>
                  <td>
                    <a href={resolveRelative(slug as Slug, f.slug as Slug)}>{titleOf(f)}</a>
                  </td>
                  <td class="date">
                    {date && <time datetime={date.toISOString()}>{isoDate(date)}</time>}
                  </td>
                  <td class="num">{words.toLocaleString("en")}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </section>
    )
  }

  FolderTree.css = style
  return FolderTree
}) satisfies QuartzComponentConstructor
