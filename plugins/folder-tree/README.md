# @tplant/folder-tree

Lists what is below a folder, on the folder's own page, as the output of a
shell command:

- `trees`: `tree --dirsfirst` output. Every note below the folder, nested by
  subfolder, with a count of directories and files. The list is a nested `<ul>`
  and the box-drawing branches are drawn in CSS, so it reads as a list to a
  screen reader and wraps on a narrow screen without breaking the branches.
- `lists`: `ls -lt` output. Date, size in words and title, newest first.

## Options

| Option  | Type       | Default     | Description                           |
| ------- | ---------- | ----------- | ------------------------------------- |
| `trees` | `string[]` | `["notes"]` | Folder slugs listed as a tree.        |
| `lists` | `string[]` | `[]`        | Folder slugs listed as `ls -lt` rows. |

## Build

`node plugins/build.mjs folder-tree` from the repository root. `dist/` is committed.
