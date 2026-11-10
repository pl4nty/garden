#!/usr/bin/env node
// Builds the hand-rolled local plugins (src/ -> dist/) the same way the
// quartz-community tsup config does, without a per-plugin toolchain:
//
//   node plugins/build.mjs            # every plugin listed below
//   node plugins/build.mjs home nav   # only the named ones
//
// Quartz loads dist/ at runtime and skips the build step when it is present,
// so dist/ is committed. Run this after an edit to src/.
import { build } from "esbuild"
import * as sass from "sass"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(fileURLToPath(import.meta.url))

// plugin directory -> exported component name
const plugins = {
  nav: "Nav",
  home: "Home",
  "folder-tree": "FolderTree",
  weeks: "Weeks",
}

const scssAsText = {
  name: "scss-as-text",
  setup(b) {
    b.onLoad({ filter: /\.scss$/ }, (args) => ({
      contents: sass.compile(args.path, { style: "compressed" }).css,
      loader: "text",
    }))
  },
}

const wanted = process.argv.slice(2)
for (const [dir, component] of Object.entries(plugins)) {
  if (wanted.length > 0 && !wanted.includes(dir)) continue
  const pluginDir = path.join(root, dir)
  await build({
    absWorkingDir: pluginDir,
    entryPoints: ["src/index.ts"],
    outfile: "dist/index.js",
    bundle: true,
    format: "esm",
    platform: "node",
    target: "es2022",
    jsx: "automatic",
    jsxImportSource: "preact",
    // resolved from the repository's node_modules, so every plugin shares one
    // preact instance with Quartz
    external: ["preact", "preact/*", "@quartz-community/*"],
    plugins: [scssAsText],
    logLevel: "warning",
  })
  await mkdir(path.join(pluginDir, "dist/components"), { recursive: true })
  await writeFile(
    path.join(pluginDir, "dist/components/index.js"),
    `export { ${component} } from "../index.js"\n`,
  )
  await writeFile(
    path.join(pluginDir, "dist/components/index.d.ts"),
    `export { ${component} } from "../index.js"\n`,
  )
  await writeFile(
    path.join(pluginDir, "dist/index.d.ts"),
    `import { QuartzComponentConstructor } from "@quartz-community/types"\n\ndeclare const ${component}: QuartzComponentConstructor\n\nexport { ${component} }\n`,
  )
  console.log(`built ${dir}`)
}
