// ../shared/smallCaps.tsx
import { jsx } from "preact/jsx-runtime";
var ACRONYM = /\b[A-Z]{2,}s?\b/g;

// src/index.ts
var SKIP = /* @__PURE__ */ new Set(["code", "pre", "kbd", "samp", "abbr", "script", "style", "svg", "math"]);
function wrap(node) {
  if (!node.children) return;
  const next = [];
  for (const child of node.children) {
    if (child.type === "element" && !SKIP.has(child.tagName ?? "")) wrap(child);
    if (child.type !== "text" || !child.value) {
      next.push(child);
      continue;
    }
    let last = 0;
    for (const match of child.value.matchAll(ACRONYM)) {
      if (match.index > last)
        next.push({ type: "text", value: child.value.slice(last, match.index) });
      next.push({
        type: "element",
        tagName: "abbr",
        properties: { className: ["sc"] },
        children: [{ type: "text", value: match[0] }]
      });
      last = match.index + match[0].length;
    }
    if (last === 0) next.push(child);
    else if (last < child.value.length) next.push({ type: "text", value: child.value.slice(last) });
  }
  node.children = next;
}
var SmallCaps = () => ({
  name: "SmallCaps",
  htmlPlugins() {
    return [() => (tree) => wrap(tree)];
  }
});
export {
  SmallCaps
};
