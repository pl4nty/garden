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
            const active = current === slug || (prefix !== undefined && current.startsWith(prefix))
            return (
              <li>
                <a
                  href={resolveRelative(current as Slug, slug as Slug)}
                  class={active ? "active" : undefined}
                  aria-current={current === slug ? "page" : undefined}
                >
                  {label}
                </a>
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
