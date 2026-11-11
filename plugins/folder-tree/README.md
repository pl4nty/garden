# @tplant/folder-tree

An index of every note below a folder, grouped by subfolder. It renders on the
index page of each configured root folder and of every folder below it, and
nowhere else. It is set like the index at the back of a book, and it replaces the
file tree that the explorer showed in the sidebar.

`quartz/styles/custom.scss` hides the stock folder listing on the same pages.

## Options

| Option  | Type       | Default     | Description                          |
| ------- | ---------- | ----------- | ------------------------------------ |
| `roots` | `string[]` | `["notes"]` | Folder slugs to render a tree below. |

## Example

```yaml
- source: ./plugins/folder-tree
  enabled: true
  options:
    roots:
      - notes
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
