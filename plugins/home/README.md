# @tplant/home

The homepage. It renders on the site index only (`slug === "index"`), in two
parts that are configured as two plugin entries:

- `section: bed` is a row of plants standing on a ground line, one for each of
  the most recently tended notes. Each plant is a link to its note, and is the
  same drawing that closes the note (see `../note-plant`). Put it in
  `beforeBody`.
- `section: contents` is two lists set like a table of contents, with leader
  dots between title and date: every post, then the most recently tended
  notes. Put it in `afterBody`.

## Options

| Option        | Type                  | Default      | Description                                       |
| ------------- | --------------------- | ------------ | ------------------------------------------------- |
| `section`     | `"bed" \| "contents"` | `"contents"` | The part to render.                               |
| `postsFolder` | `string`              | `"posts"`    | Folder slug that holds the posts.                 |
| `notesFolder` | `string`              | `"notes"`    | Folder slug that holds the notes.                 |
| `plants`      | `number`              | `22`         | Bed: the number of plants.                        |
| `recentCount` | `number`              | `6`          | Contents: the number of notes in the second list. |

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/`, to `../note-plant/src` or to `../shared`:

```bash
node plugins/build.mjs home
```
