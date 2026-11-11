# @tplant/home

The homepage. It renders on the site index only (`slug === "index"`), in three
parts that are configured as three plugin entries:

- `section: bed` is a row of plants growing from a wire, one for each of the
  most recently tended notes. Each plant is a link to its note, and is the
  same drawing that closes the note (see `../note-plant`). Put it in
  `beforeBody`.
- `section: contents` is every post as a parts list: item number, title, date
  and word count. Put it in `afterBody`.
- `section: revisions` is the latest changes to notes as a revision history:
  date, note and folder. Put it in `right`: on a wide screen
  `quartz/styles/custom.scss` fixes it in the top right of the sheet, where a
  drawing keeps its revision history.

The tables use the class `bom`, which `quartz/styles/custom.scss` rules.

## Options

| Option        | Type                                 | Default      | Description                       |
| ------------- | ------------------------------------ | ------------ | --------------------------------- |
| `section`     | `"bed" \| "contents" \| "revisions"` | `"contents"` | The part to render.               |
| `postsFolder` | `string`                             | `"posts"`    | Folder slug that holds the posts. |
| `notesFolder` | `string`                             | `"notes"`    | Folder slug that holds the notes. |
| `plants`      | `number`                             | `22`         | Bed: the number of plants.        |
| `recentCount` | `number`                             | `8`          | Revisions: the number of rows.    |

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/` or to `../note-plant/src`:

```bash
node plugins/build.mjs home
```
