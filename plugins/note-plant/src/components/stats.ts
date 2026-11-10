import type { QuartzPluginData } from "@quartz-community/types"
import { simplifySlug } from "@quartz-community/utils"

export interface NoteStats {
  words: number
  linksOut: number
  linksIn: number
}

// What a note's plant is drawn from: its length, the notes it links to and the
// notes that link to it.
export function noteStats(file: QuartzPluginData, allFiles: QuartzPluginData[]): NoteStats {
  const here = simplifySlug((file.slug ?? "") as string) as string
  const pages = new Set(allFiles.map((f) => simplifySlug((f.slug ?? "") as string) as string))
  const linksOut = new Set(
    ((file.links ?? []) as string[]).filter((link) => link !== here && pages.has(link)),
  ).size
  const linksIn = allFiles.filter(
    (f) => f.slug !== file.slug && ((f.links ?? []) as string[]).includes(here),
  ).length
  const words = ((file.text ?? "") as string).split(/\s+/).filter(Boolean).length
  return { words, linksOut, linksIn }
}
