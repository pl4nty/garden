// What the sidebar, the banner and the colophon all need to know about a
// page: its title, its date, and which pages were tended most recently.
import type { QuartzPluginData } from "@quartz-community/types"
import { getDate } from "@quartz-community/utils"

export interface Dated {
  f: QuartzPluginData
  date: Date
}

type Cfg = { defaultDateType?: unknown }

export const titleOf = (f: QuartzPluginData) => (f.frontmatter?.title ?? f.slug ?? "") as string

// The page's date of the type the site is configured to show.
export function dateOf(f: QuartzPluginData, cfg: unknown): Date | undefined {
  const type = f.defaultDateType ?? ((cfg as Cfg).defaultDateType as string | undefined)
  if (!type) return undefined
  return getDate({ ...f, defaultDateType: type } as QuartzPluginData)
}

// "30 Dec 2023"
export const dayMonthYear = (date: Date, locale: string) =>
  date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })

// The dated pages below any of `folders` ("posts", "notes"), newest first.
// Folder index pages are left out.
export function newestFirst(
  allFiles: QuartzPluginData[],
  cfg: unknown,
  folders: string[],
): Dated[] {
  const prefixes = folders.map((folder) => `${folder.replace(/\/$/, "")}/`)
  return allFiles
    .filter((f) => {
      const slug = (f.slug ?? "") as string
      return prefixes.some((prefix) => slug.startsWith(prefix)) && !slug.endsWith("/index")
    })
    .map((f) => ({ f, date: dateOf(f, cfg) }))
    .filter((page): page is Dated => Boolean(page.date))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}
