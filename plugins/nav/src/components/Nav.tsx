import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils"
import { smallCaps } from "../../../shared/smallCaps"
import style from "./styles/nav.scss"

export interface NavOptions {
  // Label -> slug. A slug that ends in "/" is a folder ("posts/"), and every
  // page below it marks the link as current.
  links: Record<string, string>
}

type Slug = Parameters<typeof resolveRelative>[0]

export default ((opts?: Partial<NavOptions>) => {
  const links = Object.entries(opts?.links ?? {}).map(([label, target]) => {
    const folder = target.endsWith("/")
    const slug = (folder ? `${target}index` : target).toLowerCase()
    return { label, slug, prefix: folder ? target.toLowerCase() : undefined }
  })

  const Nav: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const current = (fileData.slug ?? "") as string
    return (
      <nav class={`site-nav ${displayClass ?? ""}`} aria-label="Site">
        <ul>
          {links.map(({ label, slug, prefix }) => {
            const inside = prefix !== undefined && current.startsWith(prefix)
            const active = current === slug || inside
            // a page below a folder is listed under the folder's link, as the
            // running head of a book names the chapter
            const here = inside && !current.endsWith("/index") ? fileData.frontmatter?.title : null
            return (
              <li>
                <a
                  href={resolveRelative(current as Slug, slug as Slug)}
                  class={active ? "active" : undefined}
                  aria-current={current === slug ? "page" : undefined}
                >
                  {label}
                </a>
                {here && <span class="here">{smallCaps(here)}</span>}
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  Nav.css = style
  return Nav
}) satisfies QuartzComponentConstructor
