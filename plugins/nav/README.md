# @tplant/nav

The head of every page: the header line of a manual page, which links home, and
the site's sections as paths. The path for the section that holds the current
page is marked as active.

```
TPLANT(7)                        Tom's Garden                         TPLANT(7)

~/posts  ~/notes  ~/ideas  ~/now  ~/whoami
```

The middle field is `pageTitle` from the site configuration.

## Options

| Option    | Type                     | Default | Description                                                               |
| --------- | ------------------------ | ------- | ------------------------------------------------------------------------- |
| `name`    | `string`                 | `SITE`  | The name at both ends of the header line.                                 |
| `section` | `number`                 | `7`     | The manual section after the name.                                        |
| `links`   | `Record<string, string>` | `{}`    | Label to slug. A slug that ends in `/` is a folder, for example `posts/`. |

## Example

```yaml
- source: ./plugins/nav
  enabled: true
  options:
    name: TPLANT
    section: 7
    links:
      ~/posts: posts/
      ~/whoami: whoami
  layout:
    position: left
    priority: 12
```

## Build

`node plugins/build.mjs nav` from the repository root. `dist/` is committed.
