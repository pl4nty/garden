import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils"
import { Cmd, LsRows, dateOf, titleOf, wordCount } from "../../../shared/listing"
import style from "./styles/folderTree.scss"

export interface FolderTreeOptions {
  // Folder slugs listed as `tree` output: every note below the folder, nested
  // by subfolder. Shown on the index page of the folder and of each subfolder.
  trees: string[]
  // Folder slugs listed as `ls -lt` output: date, size and title, newest first.
  lists: string[]
}

const defaultOptions: FolderTreeOptions = {
  trees: ["notes"],
  lists: [],
}

type Slug = Parameters<typeof resolveRelative>[0]

// A directory in the tree. `name` is its slug segment.
interface Dir {
  name: string
  slug: string
  dirs: Map<string, Dir>
  files: QuartzPluginData[]
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export default ((opts?: Partial<FolderTreeOptions>) => {
  const options: FolderTreeOptions = { ...defaultOptions, ...opts }
  const clean = (roots: string[]) => roots.map((r) => r.replace(/\/$/, "").toLowerCase())
  const trees = clean(options.trees)
  const lists = clean(options.lists)
  const below = (roots: string[], folder: string) =>
    roots.some((r) => folder === r || folder.startsWith(`${r}/`))

  const FolderTree: QuartzComponent = ({
    fileData,
    allFiles,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    const slug = (fileData.slug ?? "") as string
    if (!slug.endsWith("/index")) return null
    const here = slug.slice(0, -"/index".length)
    const href = (to: string) => resolveRelative(slug as Slug, to as Slug)
    const locale = cfg.locale || "en-US"
    const pages = allFiles.filter((f) => {
      const s = f.slug as string | undefined
      return s && s.startsWith(`${here}/`) && !s.endsWith("/index")
    })
    if (pages.length === 0) return null

    if (below(lists, here)) {
      const rows = pages
        .map((f) => ({
          href: href(f.slug as string),
          title: titleOf(f),
          date: dateOf(f, cfg),
          words: wordCount(f),
        }))
        .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
      return (
        <section class={`folder-ls ${displayClass ?? ""}`}>
          <Cmd label={`${rows.length} pages, newest first`}>ls -lt ~/{here}</Cmd>
          <p class="ls-total">total {rows.length}</p>
          <LsRows rows={rows} />
        </section>
      )
    }

    if (!below(trees, here)) return null

    const root: Dir = { name: here, slug: here, dirs: new Map(), files: [] }
    let dirCount = 0
    for (const f of pages) {
      const parts = (f.slug as string).slice(here.length + 1).split("/")
      let dir = root
      for (const part of parts.slice(0, -1)) {
        let next = dir.dirs.get(part)
        if (!next) {
          next = { name: part, slug: `${dir.slug}/${part}`, dirs: new Map(), files: [] }
          dir.dirs.set(part, next)
          dirCount++
        }
        dir = next
      }
      dir.files.push(f)
    }

    // Directories first, then files, each in alphabetical order: the order of
    // `tree --dirsfirst`. The box-drawing lines come from CSS, so the list
    // stays a nested list to a screen reader and to the clipboard.
    const list = (dir: Dir) => (
      <ul>
        {[...dir.dirs.values()]
          .sort((a, b) => a.name.localeCompare(b.name, locale))
          .map((d) => (
            <li>
              <a class="tree-dir" href={href(`${d.slug}/index`)}>
                {d.name}/
              </a>
              {list(d)}
            </li>
          ))}
        {dir.files
          .sort((a, b) =>
            titleOf(a).localeCompare(titleOf(b), locale, { numeric: true, sensitivity: "base" }),
          )
          .map((f) => (
            <li>
              <a href={href(f.slug as string)}>{titleOf(f)}</a>
            </li>
          ))}
      </ul>
    )

    return (
      <section class={`folder-tree ${displayClass ?? ""}`}>
        <Cmd label={`${pages.length} notes, by folder`}>tree --dirsfirst ~/{here}</Cmd>
        <div class="tree">
          <p>~/{here}</p>
          {list(root)}
        </div>
        <p class="tree-total">
          {plural(dirCount, "directory", "directories")}, {plural(pages.length, "file", "files")}
        </p>
      </section>
    )
  }

  FolderTree.css = style
  return FolderTree
}) satisfies QuartzComponentConstructor
