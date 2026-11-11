# @tplant/footer

The foot of every page, in two lines: the site's pages (with RSS), which is
the whole of the site's navigation apart from the way back at the head of a
page (`../nav`), and a fainter line with the links out. A local fork of
`@quartz-community/footer`.

## Options

| Option  | Type                     | Default | Description                                                               |
| ------- | ------------------------ | ------- | ------------------------------------------------------------------------- |
| `pages` | `Record<string, string>` | `{}`    | Label to slug. `""` is the homepage; a slug that ends in `/` is a folder. |
| `links` | `Record<string, string>` | `{}`    | Label to URL, for the second line.                                        |

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/`:

```bash
node plugins/build.mjs footer
```
