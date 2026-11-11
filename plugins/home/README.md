# @tplant/home

The banner of the homepage: a garden bed in two inks, drawn in the browser on a
low-resolution canvas with an ordered dither. It renders on the site index only
(`slug === "index"`).

The front row holds a plant for each of the most recently tended notes. Behind
it stand the posts, which are daisies, with more notes between them. Each plant
is a link to its page: the link lies over the plant, and pointing at it or
focusing it prints the plant in the second ink and names the page in the
caption. `../note-plant` draws the same plant at the foot of the page itself.

The component writes only the list of pages and the numbers each plant grows
from. The drawing is in `../shared/garden`:

| File               | What it does                                                   |
| ------------------ | -------------------------------------------------------------- |
| `plants.ts`        | Grows one plant from a note: height, flowers, species, habit.  |
| `raster.ts`        | The two plates of ink, the shapes, and the dither.             |
| `scene.ts`         | Composes the bed (hedges, sun or moon, two rows) and the stamp |
| `garden.inline.ts` | Browser code: sizes the canvas, prints it, lays out the links. |

The hedges are seeded with the date, so they change from day to day; the sun
(the moon after dark) stands where the visitor's clock puts it. The plants
change only when their notes do. With scripting off the frame shows a halftone
pattern from the stylesheet.

## Options

| Option        | Type     | Default   | Description                                                       |
| ------------- | -------- | --------- | ----------------------------------------------------------------- |
| `notesFolder` | `string` | `"notes"` | Folder slug that holds the notes.                                 |
| `postsFolder` | `string` | `"posts"` | Folder slug that holds the posts.                                 |
| `plants`      | `number` | `36`      | The most notes to send. The browser draws as many as fit.         |
| `height`      | `number` | `64`      | Height of the picture in cells. The stylesheet reserves 64 cells. |

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/`, to `../note-plant/src` or to `../shared`:

```bash
node plugins/build.mjs home
```
