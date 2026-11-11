# @tplant/note-plant

The colophon of a note: its own plant as a small two-ink stamp, in front of a
setting sun, with the date the note was last tended and a line that says what
the plant is grown from. The plant is a function of the note, so a note always
grows the same plant, and the plant changes only when the note does.

| Part of the plant | Comes from                                                       |
| ----------------- | ---------------------------------------------------------------- |
| Height            | The length of the note: one level for each doubling of words.    |
| Flowers           | One for each link between this note and another, either way.     |
| Species           | The folder the note is filed in. A post is always a daisy.       |
| Habit             | A random sequence seeded with the slug: sides, leans and angles. |

The browser draws the stamp with `../shared/garden` (see `../home` for the
files). With scripting off only the caption shows. The homepage shows the same
plants in a bed. The stamp renders on notes only: not on the homepage, folder
pages or tag pages.

## Options

| Option  | Type       | Default | Description                                             |
| ------- | ---------- | ------- | ------------------------------------------------------- |
| `roots` | `string[]` | `[]`    | Folder slugs to draw plants in. Empty means every note. |

## Example

```yaml
- source: ./plugins/note-plant
  enabled: true
  layout:
    position: afterBody
    priority: 3
```

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/` or to `../shared`:

```bash
node plugins/build.mjs note-plant
```
