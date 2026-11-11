# @tplant/note-plant

Draws a plant at the end of each note: a stem routed like a PCB trace from a
row of pads, with vias at the joints. The plant is a function of the note, so a note always grows the
same plant, and the plant changes only when the note does.

| Part of the plant | Comes from                                                       |
| ----------------- | ---------------------------------------------------------------- |
| Height            | The length of the note: one level for each doubling of words.    |
| Leaves            | One for each note this one links to (10 at most).                |
| Buds              | One for each note that links here (8 at most).                   |
| Shape             | A random sequence seeded with the slug: sides, bends and angles. |

A note with no links in either direction is a seedling with two seed leaves.

The caption says what the plant is drawn from: the three numbers. The colours
are in `quartz/styles/custom.scss`: on paper the plant is drawn as a schematic
(green wires, pads outlined in red), in dark mode as copper (ringed vias, gold
pads).
The homepage shows the same plants in a row (see `../home`).
The plant renders on notes only: not on the homepage, folder pages or tag pages.

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
edit to `src/`:

```bash
node plugins/build.mjs note-plant
```
