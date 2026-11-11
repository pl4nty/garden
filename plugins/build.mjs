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

// plugin directory -> its export, and whether that export is a layout component
const plugins = {
  nav: { name: "Nav", component: true },
  home: { name: "Home", component: true },
  "folder-tree": { name: "FolderTree", component: true },
  "note-plant": { name: "NotePlant", component: true },
  footer: { name: "Footer", component: true },
  socials: { name: "Socials", component: true },
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
for (const [dir, { name, component }] of Object.entries(plugins)) {
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
  const type = component ? "QuartzComponentConstructor" : "QuartzTransformerPlugin"
  await writeFile(
    path.join(pluginDir, "dist/index.d.ts"),
    `import { ${type} } from "@quartz-community/types"\n\ndeclare const ${name}: ${type}\n\nexport { ${name} }\n`,
  )
  if (component) {
    await mkdir(path.join(pluginDir, "dist/components"), { recursive: true })
    for (const file of ["index.js", "index.d.ts"]) {
      await writeFile(
        path.join(pluginDir, "dist/components", file),
        `export { ${name} } from "../index.js"\n`,
      )
    }
  }
  console.log(`built ${dir}`)
}
