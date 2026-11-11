# @tplant/home

The homepage as a shell session. It renders on the index page only, in two
parts chosen by `section`:

- `head` (place in `beforeBody`): the command above the homepage's own text,
  `$ cat ~/index.md`.
- `listing` (place in `afterBody`): `$ ls -lt ~/posts` with every post, then
  `$ ls -lt ~/notes | head -n 8` with the notes tended most recently. Each row
  is a date, a size in words and a title.

## Options

| Option        | Type                  | Default   | Description                                 |
| ------------- | --------------------- | --------- | ------------------------------------------- |
| `section`     | `"head" \| "listing"` | `listing` | Which part to render.                       |
| `postsFolder` | `string`              | `posts`   | Folder slug that holds the posts.           |
| `notesFolder` | `string`              | `notes`   | Folder slug that holds the notes.           |
| `recentCount` | `number`              | `8`       | The number of recently tended notes listed. |

## Build

`node plugins/build.mjs home` from the repository root. `dist/` is committed.
