import type { QuartzTransformerPlugin } from "@quartz-community/types"
import { ACRONYM } from "../../shared/smallCaps"

interface Node {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: Node[]
}

// Text in these elements is left alone: code must show what was typed, and
// the others are not prose.
const SKIP = new Set(["code", "pre", "kbd", "samp", "abbr", "script", "style", "svg", "math"])

function wrap(node: Node) {
  if (!node.children) return
  const next: Node[] = []
  for (const child of node.children) {
    if (child.type === "element" && !SKIP.has(child.tagName ?? "")) wrap(child)
    if (child.type !== "text" || !child.value) {
      next.push(child)
      continue
    }
    let last = 0
    for (const match of child.value.matchAll(ACRONYM)) {
      if (match.index > last)
        next.push({ type: "text", value: child.value.slice(last, match.index) })
      next.push({
        type: "element",
        tagName: "abbr",
        properties: { className: ["sc"] },
        children: [{ type: "text", value: match[0] }],
      })
      last = match.index + match[0].length
    }
    if (last === 0) next.push(child)
    else if (last < child.value.length) next.push({ type: "text", value: child.value.slice(last) })
  }
  node.children = next
}

/**
 * Wraps acronyms in note bodies in `<abbr class="sc">`, which the theme sets
 * in small caps. See ../../shared/smallCaps.tsx for the rule.
 */
export const SmallCaps: QuartzTransformerPlugin = () => ({
  name: "SmallCaps",
  htmlPlugins() {
    return [() => (tree: Node) => wrap(tree)]
  },
})
