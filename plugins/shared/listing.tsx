import type { GlobalConfiguration, QuartzPluginData } from "@quartz-community/types"
import { getDate } from "@quartz-community/utils"

// A date the way `ls --time-style=long-iso` prints it: 2023-01-31.
export const isoDate = (d: Date) => d.toISOString().slice(0, 10)

// The number of words in a page.
export const wordCount = (f: QuartzPluginData) =>
  ((f.text ?? "") as string).split(/\s+/).filter(Boolean).length

// A size the way `ls -lh` prints it: 719, 1.4k, 12k.
export function humanSize(n: number) {
  if (n < 1000) return String(n)
  const k = n / 1000
  return k < 9.95 ? `${k.toFixed(1)}k` : `${Math.round(k)}k`
}

// The date a page is listed under: its own date type, or the site's default.
export function dateOf(f: QuartzPluginData, cfg: GlobalConfiguration): Date | undefined {
  const fallback = (cfg as Record<string, unknown>).defaultDateType as string | undefined
  const data = { ...f, defaultDateType: f.defaultDateType ?? fallback } as QuartzPluginData
  return data.defaultDateType ? getDate(data) : undefined
}

export const titleOf = (f: QuartzPluginData) => (f.frontmatter?.title ?? f.slug ?? "") as string

export interface LsRow {
  href: string
  title: string
  date?: Date
  words: number
}

// The rows of `ls -l`: date, size in words, name. The columns are set by
// `.ls` in quartz/styles/custom.scss.
export function LsRows({ rows }: { rows: LsRow[] }) {
  return (
    <ul class="ls">
      {rows.map(({ href, title, date, words }) => (
        <li>
          {date ? <time datetime={date.toISOString()}>{isoDate(date)}</time> : <span />}
          <span class="ls-size" title={`${words.toLocaleString("en")} words`}>
            {humanSize(words)}
          </span>
          <a href={href}>{title}</a>
        </li>
      ))}
    </ul>
  )
}

// A shell command that heads a listing. The "$" comes from `.cmd::before`.
export function Cmd({ children, label }: { children: preact.ComponentChildren; label: string }) {
  return (
    <h2 class="cmd" aria-label={label}>
      {children}
    </h2>
  )
}
