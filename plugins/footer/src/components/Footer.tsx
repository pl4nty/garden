import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";
import style from "./styles/footer.scss";

export interface FooterOptions {
  links: Record<string, string>;
}

// Local fork of @quartz-community/footer matching the previous v4 footer:
// no "Created with Quartz vX" version stamp, plus the "Cultivated with
// Obsidian and Quartz" attribution. The compiled output in dist/ is what
// Quartz loads at runtime; keep it in sync when editing this file.
export default ((opts?: FooterOptions) => {
  const Footer: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const links = opts?.links ?? [];
    return (
      <footer class={`${displayClass ?? ""}`}>
        <hr />
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
          <li>
            Cultivated with <a href="https://obsidian.md/">Obsidian</a> and{" "}
            <a href="https://quartz.jzhao.xyz/">Quartz</a>
          </li>
        </ul>
      </footer>
    );
  };

  Footer.css = style;
  return Footer;
}) satisfies QuartzComponentConstructor;
