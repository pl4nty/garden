# @tplant/nav

The head of a page. On the homepage it is the site's name (`pageTitle` from
the site configuration) with one line under it. On every other page it is one
link, "Back", to the page one level up: a note's folder, a folder's parent, or
the homepage. The rest of the site's navigation is the line of links in the
footer (`../footer`).

## Options

| Option       | Type     | Default | Description                                    |
| ------------ | -------- | ------- | ---------------------------------------------- |
| `descriptor` | `string` | `""`    | The line under the site name, on the homepage. |

## Example

```yaml
- source: ./plugins/nav
  enabled: true
  options:
    descriptor: notes and posts by Tom Plant
  layout:
    position: left
    priority: 10
```

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/`:

```bash
node plugins/build.mjs nav
```
