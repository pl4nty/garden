import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { getDate, resolveRelative } from "@quartz-community/utils"
import { smallCaps } from "../../../shared/smallCaps"
import style from "./styles/folderTree.scss"

export interface FolderTreeOptions {
  // Folder slugs to render a tree for. The tree shows on the index page of each
  // root and of every folder below it.
  roots: string[]
}

const defaultOptions: FolderTreeOptions = {
  roots: ["notes"],
}

type Slug = Parameters<typeof resolveRelative>[0]

interface Group {
  // slug of the folder, without a trailing slash
  folder: string
  // display names of the folder, relative to the page's folder
  names: string[]
  notes: { f: QuartzPluginData; date?: Date }[]
}

export default ((opts?: Partial<FolderTreeOptions>) => {
  const options: FolderTreeOptions = { ...defaultOptions, ...opts }
  const roots = options.roots.map((r) => r.replace(/\/$/, "").toLowerCase())

  const FolderTree: QuartzComponent = ({
    fileData,
    allFiles,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    const slug = (fileData.slug ?? "") as string
    if (!slug.endsWith("/index")) return null
    const here = slug.slice(0, -"/index".length)
    if (!roots.some((r) => here === r || here.startsWith(`${r}/`))) return null

    const locale = cfg.locale || "en-US"
    const cfgDateType = (cfg as Record<string, unknown>).defaultDateType as string | undefined
    const dateOf = (f: QuartzPluginData) => {
      const data = {
        ...f,
        defaultDateType: f.defaultDateType ?? cfgDateType,
      } as QuartzPluginData
      return data.defaultDateType ? getDate(data) : undefined
    }
    const depth = here.split("/").length

    const groups = new Map<string, Group>()
    for (const f of allFiles) {
      const s = f.slug as string | undefined
      if (!s || !s.startsWith(`${here}/`) || s.endsWith("/index")) continue
      const folder = s.split("/").slice(0, -1).join("/")
      const names = ((f.relativePath ?? "") as string).split("/").slice(depth, -1)
      const group = groups.get(folder) ?? { folder, names, notes: [] }
      group.notes.push({ f, date: dateOf(f) })
      groups.set(folder, group)
    }
    if (groups.size === 0) return null

    // Notes that sit directly in this folder go last, below the subfolders.
    const sorted = [...groups.values()].sort((a, b) => {
      if (a.folder === here) return 1
      if (b.folder === here) return -1
      return a.folder.localeCompare(b.folder)
    })
    const total = sorted.reduce((n, g) => n + g.notes.length, 0)
    const hasSubfolders = sorted.some((g) => g.folder !== here)

    return (
      <section class={`folder-tree ${displayClass ?? ""}`}>
        <p class="folder-tree-count">
          {total} {total === 1 ? "note" : "notes"}
          {hasSubfolders && ` in ${sorted.filter((g) => g.folder !== here).length} folders`}
        </p>
        <div class={`folder-tree-groups ${hasSubfolders ? "" : "single"}`}>
          {sorted.map((group) => (
            <div class="folder-tree-group">
              {hasSubfolders && (
                <h2>
                  {group.folder === here ? (
                    "Everything else"
                  ) : (
                    <a href={resolveRelative(slug as Slug, `${group.folder}/index` as Slug)}>
                      {group.names.join(" / ")}
                    </a>
                  )}
                  <span class="folder-tree-n">{group.notes.length}</span>
                </h2>
              )}
              <ul>
                {group.notes
                  .sort((a, b) =>
                    (a.f.frontmatter?.title ?? "").localeCompare(
                      b.f.frontmatter?.title ?? "",
                      locale,
                      { numeric: true, sensitivity: "base" },
                    ),
                  )
                  .map(({ f, date }) => (
                    <li>
                      <a href={resolveRelative(slug as Slug, f.slug as Slug)}>
                        <span>{smallCaps((f.frontmatter?.title ?? f.slug ?? "") as string)}</span>
                        {date && (
                          <time datetime={date.toISOString()}>
                            {date.toLocaleDateString(locale, { month: "short", year: "numeric" })}
                          </time>
                        )}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    )
  }

  FolderTree.css = style
  return FolderTree
}) satisfies QuartzComponentConstructor
