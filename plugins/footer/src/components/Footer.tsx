import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils"
import style from "./styles/footer.scss"

export interface FooterOptions {
  // The site's pages, label to slug. A slug that ends in "/" is a folder.
  pages: Record<string, string>
  // Links out, label to URL.
  links: Record<string, string>
}

type Slug = Parameters<typeof resolveRelative>[0]

// The foot of every page: one line with the site's pages, which is the whole
// of the site's navigation apart from the way back at the head, and a fainter
// line with the links out.
export default ((opts?: Partial<FooterOptions>) => {
  const pages = Object.entries(opts?.pages ?? {}).map(([label, target]) => ({
    label,
    slug: target === "" ? "index" : target.endsWith("/") ? `${target}index` : target,
  }))
  const links = Object.entries(opts?.links ?? {})

  const Footer: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const current = (fileData.slug ?? "index") as string
    const to = (slug: string) => resolveRelative(current as Slug, slug as Slug)
    return (
      <footer class={`${displayClass ?? ""}`}>
        <nav aria-label="Pages">
          <ul>
            {pages.map(({ label, slug }) => (
              <li>
                <a href={to(slug)} aria-current={current === slug ? "page" : undefined}>
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a href={to("index.xml")} data-router-ignore>
                rss
              </a>
            </li>
          </ul>
        </nav>
        <ul class="footer-out">
          {links.map(([label, url]) => (
            <li>
              <a href={url}>{label}</a>
            </li>
          ))}
          <li>
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
