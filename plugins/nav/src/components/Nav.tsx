import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils"
import style from "./styles/nav.scss"

export interface NavOptions {
  // The line under the site name on the homepage.
  descriptor: string
}

type Slug = Parameters<typeof resolveRelative>[0]

// The slug of the page one level up: a note's folder, a folder's parent, and
// the homepage for anything at the top.
function parentOf(slug: string) {
  const parts = slug.split("/")
  if (parts[parts.length - 1] === "index") parts.pop()
  parts.pop()
  return parts.length === 0 ? "index" : `${parts.join("/")}/index`
}

// The whole of the site's navigation at the head of a page: on the homepage
// the site's name, and on every other page one link back up.
export default ((opts?: Partial<NavOptions>) => {
  const Nav: QuartzComponent = ({
    fileData,
    allFiles,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    const slug = (fileData.slug ?? "index") as string
    if (slug === "index") {
      return (
        <div class={`site-name ${displayClass ?? ""}`}>
          <h1>{cfg.pageTitle}</h1>
          {opts?.descriptor && <p>{opts.descriptor}</p>}
        </div>
      )
    }

    const parent = parentOf(slug)
    const page = allFiles.find((f) => f.slug === parent)
    const name =
      parent === "index"
        ? "the garden"
        : ((page?.frontmatter?.title as string | undefined) ?? parent.split("/").slice(-2)[0])
    return (
      <nav class={`site-back ${displayClass ?? ""}`} aria-label="Site">
        <a href={resolveRelative(slug as Slug, parent as Slug)} aria-label={`Back to ${name}`}>
          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
            <path d="M14 8H2.5M7 3.5 2.5 8 7 12.5" />
          </svg>
          Back
        </a>
      </nav>
    )
  }

  Nav.css = style
  return Nav
}) satisfies QuartzComponentConstructor
