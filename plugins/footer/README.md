# @tplant/footer

The sheet. It takes Quartz's footer slot, so it is on every page, and draws two
things:

- **The frame**: a double border round the viewport with zone markers along its
  edges (1 to 6 across, A to D down), as on an A4 drawing sheet in KiCad. It is
  fixed, so it stays in view while a page scrolls. Phones get no frame.
- **The title block**: a ruled block filled in from the page. It stands in for
  the usual line of date and reading time under a page's title.

| Field    | Comes from                                                             |
| -------- | ---------------------------------------------------------------------- |
| Site     | `site`, with the site's mark                                           |
| Sheet    | The page's slug, as a path: `/posts/some-post`, `/notes/` for a folder |
| Title    | The page's title                                                       |
| Date     | The page's date (the newest page below it, for a folder)               |
| Size     | The page's word count (the number of pages below it, for a folder)     |
| Rev      | The number of commits that touched the file, linked to its history     |
| Drawn by | `drawnBy`                                                              |
| Licence  | `licence`                                                              |
| Tools    | Obsidian and Quartz                                                    |

The revision count comes from one `git log` over the content directory at build
time. Without git, or in a shallow clone, the field shows the word "history"
and still links to the file's history.

From 1200px the title block is fixed in the bottom right corner of the frame.
From 801px to 1199px it ends the page and meets that corner when the page is
scrolled to its end. On a phone it is a full-width block at the end of the page.

Sizes (`--frame`, `--frame-m`, `--margin`, `--sheet-max`) and colours (`--rule`,
`--wire`, `--label`) are set in `quartz/styles/custom.scss`.

## Options

| Option       | Type                              | Default  | Description                                      |
| ------------ | --------------------------------- | -------- | ------------------------------------------------ |
| `site`       | `string`                          | `""`     | The name of the site.                            |
| `drawnBy`    | `string`                          | `""`     | The author.                                      |
| `repository` | `string`                          | `""`     | URL of the repository that holds the content.    |
| `branch`     | `string`                          | `"main"` | The branch the history links point to.           |
| `licence`    | `{ label: string; href: string }` | none     | The licence of the content and where to read it. |

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/`:

```bash
node plugins/build.mjs footer
```
