// Runs of two or more capitals (CTF, ADMX, NSGs) are set in small caps, as in
// a printed book, so that acronyms do not shout in running text. The text
// itself is not changed: the font's c2sc feature draws the capitals as small
// caps, so copy, search and screen readers still get "CTF".
export const ACRONYM = /\b[A-Z]{2,}s?\b/g

// "Intune ACSC hardening" -> ["Intune ", <abbr class="sc">ACSC</abbr>, " hardening"]
export function smallCaps(text: string) {
  const out: (string | preact.JSX.Element)[] = []
  let last = 0
  for (const match of text.matchAll(ACRONYM)) {
    if (match.index > last) out.push(text.slice(last, match.index))
    out.push(<abbr class="sc">{match[0]}</abbr>)
    last = match.index + match[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}
