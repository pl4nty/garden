import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { dateOf, isoDate } from "../../../shared/listing"
import style from "./styles/footer.scss"

export interface FooterOptions {
  // The left field of the footer line: where the page comes from.
  site: string
  // Slug prefix -> manual section, e.g. { whoami: 1, "notes/hardware": 4 }.
  // The longest prefix that matches a page wins.
  sections: Record<string, number>
  // The section of a page that no prefix matches.
  defaultSection: number
  // Label -> URL, listed under the footer line.
  links: Record<string, string>
}

// The footer line of a manual page (source, date, name and section), then the
// links out. The date is the day the page was last modified.
export default ((opts?: Partial<FooterOptions>) => {
  const site = opts?.site ?? ""
  const links = opts?.links ?? {}
  const fallback = opts?.defaultSection ?? 7
  // longest prefix first
  const sections = Object.entries(opts?.sections ?? {})
    .map(([prefix, n]) => [prefix.replace(/\/$/, "").toLowerCase(), n] as const)
    .sort((a, b) => b[0].length - a[0].length)

  const Footer: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
    const slug = ((fileData.slug ?? "") as string).replace(/\/index$/, "")
    const section =
      sections.find(([prefix]) => slug === prefix || slug.startsWith(`${prefix}/`))?.[1] ?? fallback
    const date = dateOf(fileData, cfg)
    return (
      <footer class={`${displayClass ?? ""}`}>
        <p class="man-line man-foot">
          <span>{site || cfg.baseUrl}</span>
          <span>{date && <time datetime={date.toISOString()}>{isoDate(date)}</time>}</span>
          <span>
            {slug}({section})
          </span>
        </p>
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
          <li class="credit">
            cultivated with <a href="https://obsidian.md/">Obsidian</a> and{" "}
            <a href="https://quartz.jzhao.xyz/">Quartz</a>
          </li>
        </ul>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
