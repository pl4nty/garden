# @tplant/nav

The site navigation: a row of links for the top bar. The link for the section
that holds the current page is marked as active.

## Options

| Option  | Type                     | Default | Description                                                               |
| ------- | ------------------------ | ------- | ------------------------------------------------------------------------- |
| `links` | `Record<string, string>` | `{}`    | Label to slug. A slug that ends in `/` is a folder, for example `posts/`. |

## Example

```yaml
- source: ./plugins/nav
  enabled: true
  options:
    links:
      Posts: posts/
      Notes: notes/
      About: whoami
  layout:
    position: left
    priority: 20
```

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/`:

```bash
node plugins/build.mjs nav
```
