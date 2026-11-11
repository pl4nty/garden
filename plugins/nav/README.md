# @tplant/nav

The index of the site, for the left sidebar. Top to bottom:

- **Selected writing**: the posts named in `featured`, each with its date, and
  a link to the rest of the posts.
- **Recent notes**: the notes modified most recently, each with its date, and
  a link to the index of all notes.
- The section links. The link for the section that holds the current page is
  marked as active.

With `part: home` it renders the two lists alone, on the homepage only.
`quartz/styles/custom.scss` shows that copy on a phone, where the sidebar is a
header with no room for the lists.

## Options

| Option        | Type                     | Default     | Description                                                               |
| ------------- | ------------------------ | ----------- | ------------------------------------------------------------------------- |
| `part`        | `"sidebar" \| "home"`    | `"sidebar"` | The whole index, or the two lists alone on the homepage.                  |
| `links`       | `Record<string, string>` | `{}`        | Label to slug. A slug that ends in `/` is a folder, for example `posts/`. |
| `featured`    | `string[]`               | `[]`        | Slugs of the posts under "Selected writing", in order.                    |
| `postsFolder` | `string`                 | `"posts"`   | Folder slug that holds the posts.                                         |
| `notesFolder` | `string`                 | `"notes"`   | Folder slug that holds the notes.                                         |
| `recentCount` | `number`                 | `5`         | The number of notes under "Recent notes".                                 |

## Example

```yaml
- source: ./plugins/nav
  enabled: true
  options:
    featured:
      - posts/finding-an-unreleased-windows-feature
    recentCount: 4
    links:
      Posts: posts/
      Notes: notes/
      About: whoami
  layout:
    position: left
    priority: 40
```

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/` or to `../shared`:

```bash
node plugins/build.mjs nav
```
