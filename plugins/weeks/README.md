# @tplant/weeks

A "life in weeks" page, after [Gina Trapani](https://weeks.ginatrapani.org/)
and [Wait But Why](https://waitbutwhy.com/2014/05/life-weeks.html): one box for
each week, oldest first, with a label on each week that has an event.

The component renders on one note only (`slug`, default `weeks`). The note is
the data. Write it in Obsidian as a plain list:

```md
Some words of introduction. Paragraphs stay as they are.

## Canberra

- 2019-02-18 Started at university
- 2021 Built my first split keyboard

## Melbourne

- 2026-03 Moved to [[Now|Melbourne]]
```

- A list item that starts with a date is an event. The date is `YYYY`,
  `YYYY-MM` or `YYYY-MM-DD`.
- A link in the item makes the box a link.
- A `##` heading starts a chapter at the date of its first event. Each chapter
  has a colour, from a cycle of five.
- The component hides the note's headings and lists, and shows them again as a
  list below the grid, so the page reads the same without CSS.

## Options

| Option        | Type     | Default   | Description                                                                                                                             |
| ------------- | -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `slug`        | `string` | `"weeks"` | Slug of the note that holds the page.                                                                                                   |
| `born`        | `string` | `""`      | First week, as `YYYY-MM-DD`. With a date, each birthday week shows the age. Empty starts at the earliest event and marks each new year. |
| `postsFolder` | `string` | `"posts"` | Folder whose notes are added as events at their own dates. Empty adds none.                                                             |

The grid ends at the week of the build, so it grows each time the site is built.

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/`:

```bash
node plugins/build.mjs weeks
```
