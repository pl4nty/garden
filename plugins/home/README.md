# @tplant/home

The homepage. It renders on the site index only (`slug === "index"`), in two
parts that are configured as two plugin entries:

- `section: scene` is the garden that fills the first screen: sky, ground and
  a plant for every note and post, drawn as inline SVG at build time. Each
  plant is a link to its note, and is the same drawing that stands at the foot
  of the note (see `../note-plant`). Notes from one folder grow together in a
  bed; `src/components/scene.ts` holds the beds and where they lie, for a wide
  screen and for an upright phone. The colours are CSS variables that
  `../light` sets for the time of day. Put it in `beforeBody`.
- `section: index` is the plain lists that follow the note's own text: posts
  by year, then notes by folder. Put it in `afterBody`.

## Options

| Option        | Type                 | Default   | Description                       |
| ------------- | -------------------- | --------- | --------------------------------- |
| `section`     | `"scene" \| "index"` | `"index"` | The part to render.               |
| `postsFolder` | `string`             | `"posts"` | Folder slug that holds the posts. |
| `notesFolder` | `string`             | `"notes"` | Folder slug that holds the notes. |

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/` or to `../note-plant/src`:

```bash
node plugins/build.mjs home
```
