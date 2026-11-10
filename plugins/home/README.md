# @tplant/home

The homepage. It renders on the site index only (`slug === "index"`), in two
parts that are configured as two plugin entries:

- `section: hero` is the heading block with the illustration. Put it in
  `beforeBody`.
- `section: sections` is the content below the note: a row of links, the
  featured posts, the most recently modified notes, and one card for each
  folder directly below the notes folder. Put it in `afterBody`.

## Options

| Option        | Type                     | Default      | Description                                                  |
| ------------- | ------------------------ | ------------ | ------------------------------------------------------------ |
| `section`     | `"hero" \| "sections"`   | `"sections"` | The part to render.                                          |
| `eyebrow`     | `string`                 | `""`         | Hero: the small line above the heading.                      |
| `heading`     | `string`                 | `""`         | Hero: the heading. Text between asterisks is set in italics. |
| `links`       | `Record<string, string>` | `{}`         | Sections: label to URL.                                      |
| `featured`    | `string[]`               | `[]`         | Sections: ordered post slugs to feature.                     |
| `postsFolder` | `string`                 | `"posts"`    | Sections: folder slug that holds the posts.                  |
| `notesFolder` | `string`                 | `"notes"`    | Sections: folder slug that holds the notes.                  |
| `recentCount` | `number`                 | `6`          | Sections: number of recently modified notes to list.         |

## Illustration

`src/components/vine.ts` is generated. Edit the routes in `scripts/vine.mjs`,
then:

```bash
node plugins/home/scripts/vine.mjs
```

```bash
node plugins/build.mjs home
```

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/`:

```bash
node plugins/build.mjs home
```
