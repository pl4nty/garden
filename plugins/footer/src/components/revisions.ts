import { execFileSync } from "node:child_process"

// How many commits have touched each file below a directory, from one
// `git log` over the directory. The count is the revision of a page in its
// title block. Without git, or in a checkout without history, the map is
// empty and the title block shows no number.
const cache = new Map<string, Map<string, number>>()

export function revisions(dir: string): Map<string, number> {
  const known = cache.get(dir)
  if (known) return known
  const counts = new Map<string, number>()
  try {
    const out = execFileSync(
      "git",
      ["-c", "core.quotepath=off", "log", "--format=", "--name-only", "--", dir],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] },
    )
    for (const line of out.split("\n")) {
      if (line) counts.set(line, (counts.get(line) ?? 0) + 1)
    }
  } catch {
    // no git: no revisions
  }
  cache.set(dir, counts)
  return counts
}
