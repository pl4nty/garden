# @tplant/note-plant

Draws a plant for each note, as soft filled shapes, and stands it at the foot
of the note with the dates the note was planted and tended. The plant is a
function of the note, so a note always grows the same plant, and the plant
changes only when the note does.

| Part of the plant | Comes from                                                                       |
| ----------------- | -------------------------------------------------------------------------------- |
| Size              | The length of the note: one step for each doubling of words.                     |
| Leaves            | Each note this one links to adds leaves, blades or a branch (8 at most).         |
| Flowers           | One for each note that links here (6 at most). A post always has one of its own. |
| Species           | The folder the note lives in (`speciesOf` in `src/components/plant.ts`).         |
| Shape             | A random sequence seeded with the slug: leans, lengths and tones.                |

The drawing has no colours of its own. Each shape has a class, and the
stylesheet maps the classes to CSS variables that `../light` sets for the time
of day. The cast shadow is a `<use>` copy of the plant, skewed onto the ground
by the direction of the light.

"Planted" shows only when the note has a `created` or `date` in its
frontmatter that differs from the day it was last modified. The homepage
stands the same plants in a garden (see `../home`). The plant renders on notes
only: not on the homepage, folder pages or tag pages.

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
