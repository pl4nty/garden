import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils"
import style from "./styles/nav.scss"

export interface NavOptions {
  // The name in the header line, as a manual page names itself: TPLANT.
  name: string
  // The manual section printed after the name: TPLANT(7).
  section: number
  // Label -> slug. A slug that ends in "/" is a folder ("posts/"), and every
  // page below it marks the link as current.
  links: Record<string, string>
}

type Slug = Parameters<typeof resolveRelative>[0]

export default ((opts?: Partial<NavOptions>) => {
  const name = `${opts?.name ?? "SITE"}(${opts?.section ?? 7})`
  const links = Object.entries(opts?.links ?? {}).map(([label, target]) => {
    const folder = target.endsWith("/")
    const slug = (folder ? `${target}index` : target).toLowerCase()
    return { label, slug, prefix: folder ? target.toLowerCase() : undefined }
  })

  const Nav: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
    const current = (fileData.slug ?? "") as string
    const title = cfg.pageTitle
    return (
      <>
        {/* The header line of a manual page: name, manual, name. The whole
            line is the link home, and it reads once to a screen reader. */}
        <a
          class={`man-line man-head ${displayClass ?? ""}`}
          href={resolveRelative(current as Slug, "index" as Slug)}
          aria-label={`${title}: home`}
        >
          <span>{name}</span>
          <span>{title}</span>
          <span>{name}</span>
        </a>
        <nav class={`site-nav ${displayClass ?? ""}`} aria-label="Site">
          <ul>
            {links.map(({ label, slug, prefix }) => {
              const active =
                current === slug || (prefix !== undefined && current.startsWith(prefix))
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
      </>
    )
  }

  Nav.css = style
  return Nav
}) satisfies QuartzComponentConstructor
