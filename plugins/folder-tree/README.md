# @tplant/folder-tree

The index of a folder as a parts list: one ruled table of every page below the
folder, grouped by subfolder, with an item number, the date and the word count
of each. It renders on the index page of each configured root folder and of
every folder below it, and nowhere else. It replaces the file tree that the
explorer showed in the sidebar.

The table uses the class `bom`, which `quartz/styles/custom.scss` rules. The
same file hides the stock folder listing on the pages that have this table.

## Options

| Option        | Type       | Default     | Description                                                |
| ------------- | ---------- | ----------- | ---------------------------------------------------------- |
| `roots`       | `string[]` | `["notes"]` | Folder slugs to render a list below.                       |
| `newestFirst` | `string[]` | `[]`        | Roots listed newest first. The others are listed by title. |

## Example

```yaml
- source: ./plugins/folder-tree
  enabled: true
  options:
    roots:
      - notes
      - posts
    newestFirst:
      - posts
  layout:
    position: afterBody
    priority: 1
```

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/`:

```bash
node plugins/build.mjs folder-tree
```
