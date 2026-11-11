import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils"
import style from "./styles/nav.scss"

export interface NavOptions {
  // Label -> slug. A slug that ends in "/" is a folder ("posts/"), and every
  // page below it marks the link as current.
  links: Record<string, string>
}

type Slug = Parameters<typeof resolveRelative>[0]

// The sheet index: the top-level sheets of the site as a numbered, ruled list.
export default ((opts?: Partial<NavOptions>) => {
  const links = Object.entries(opts?.links ?? {}).map(([label, target]) => {
    const folder = target.endsWith("/")
    const slug = (folder ? `${target}index` : target).toLowerCase()
    return { label, slug, prefix: folder ? target.toLowerCase() : undefined }
  })

  const Nav: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const current = (fileData.slug ?? "") as string
    return (
      <nav class={`site-nav ${displayClass ?? ""}`} aria-labelledby="site-nav-label">
        <p class="site-nav-label" id="site-nav-label">
          Sheets
        </p>
        <ol>
          {links.map(({ label, slug, prefix }) => {
            const inside = prefix !== undefined && current.startsWith(prefix)
            const active = current === slug || inside
            // a page below a folder hangs from the folder's entry, as a
            // sub-sheet does in a hierarchy
            const here = inside && !current.endsWith("/index") ? fileData.frontmatter?.title : null
            return (
              <li class={active ? "active" : undefined}>
                <a
                  href={resolveRelative(current as Slug, slug as Slug)}
                  aria-current={current === slug ? "page" : undefined}
                >
                  {label}
                </a>
                {here && <span class="here">{here}</span>}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }

  Nav.css = style
  return Nav
}) satisfies QuartzComponentConstructor
