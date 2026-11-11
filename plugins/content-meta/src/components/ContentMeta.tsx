import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { dateOf, humanSize, isoDate, wordCount } from "../../../shared/listing"
import style from "./styles/contentMeta.scss"

export interface ContentMetaOptions {
  // Whether to show the reading time, at 200 words a minute.
  showReadingTime: boolean
  // The repository's commit history for a file is at `${historyUrl}${filePath}`.
  // Empty leaves the link out.
  historyUrl: string
}

const defaultOptions: ContentMetaOptions = {
  showReadingTime: true,
  historyUrl: "https://github.com/pl4nty/garden/commits/main/",
}

// The line under a page's title: the date it was last modified, its size the
// way the listings give it, the time it takes to read, and its history.
export default ((opts?: Partial<ContentMetaOptions>) => {
  const options: ContentMetaOptions = { ...defaultOptions, ...opts }

  const ContentMeta: QuartzComponent = ({ cfg, fileData, displayClass }: QuartzComponentProps) => {
    if (!fileData.text) return null
    const date = dateOf(fileData, cfg)
    const words = wordCount(fileData)
    return (
      <p class={`content-meta ${displayClass ?? ""}`}>
        {date && <time datetime={date.toISOString()}>{isoDate(date)}</time>}
        <span>{humanSize(words)} words</span>
        {options.showReadingTime && <span>{Math.max(1, Math.ceil(words / 200))} min read</span>}
        {options.historyUrl && fileData.filePath && (
          <a
            href={`${options.historyUrl}${fileData.filePath}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            history
          </a>
        )}
      </p>
    )
  }

  ContentMeta.css = style
  return ContentMeta
}) satisfies QuartzComponentConstructor
