import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import style from "./styles/socials.scss"

export interface SocialsOptions {
  // Label -> URL.
  links: Record<string, string>
}

// Links that leave the site, each drawn as a global label: the flag that
// marks a connection to somewhere off the sheet.
export default ((opts?: SocialsOptions) => {
  const Socials: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const links = opts?.links ?? {}
    return (
      <nav class={`socials ${displayClass ?? ""}`} aria-labelledby="socials-label">
        <p class="socials-label" id="socials-label">
          Off sheet
        </p>
        <ul>
          {Object.entries(links).map(([label, url]) => (
            <li>
              <a href={url} class="social-link" target="_blank" rel="noopener noreferrer me">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  Socials.css = style
  return Socials
}) satisfies QuartzComponentConstructor
