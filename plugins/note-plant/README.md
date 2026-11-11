# @tplant/note-plant

Draws a plant in ASCII at the end of each note. The plant is a function of the
note, so a note always grows the same plant, and the plant changes only when
the note does.

```
  *
 \|
o-|/
  |
__|__  tended 2023-01-31 · 719 words · 2 links out · 2 links in
```

| Part of the plant | Comes from                                                                  |
| ----------------- | --------------------------------------------------------------------------- |
| Height            | The length of the note: one line of stem for each doubling of its words.    |
| Leaves (`\`, `/`) | One for each note this one links to, two to a line of stem at most.         |
| Flowers (`*`,`o`) | One for each note that links here: the first at the tip, the rest on twigs. |
| Sides             | A random sequence seeded with the slug.                                     |

The caption shows the date the note was last modified and the three numbers.
The plant renders on notes only: not on the homepage, folder pages or tag pages.

`src/components/ascii.ts` grows the plant and `src/components/stats.ts` counts
the words and links.

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

## Build

`node plugins/build.mjs note-plant` from the repository root. `dist/` is committed.
