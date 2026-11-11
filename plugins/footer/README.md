# @tplant/footer

The foot of every page: the footer line of a manual page, then the site's links
out.

```
tplant.com.au              2023-01-31              posts/tenant-restrictions(7)
github  linkedin  homelab  rss  license      cultivated with Obsidian and Quartz
```

The line gives the site, the date the page was last modified, and the page's
slug with a manual section number. `sections` maps a slug prefix to a section,
and the longest prefix that matches wins, so `whoami` can be `whoami(1)` and
the notes on hardware `(4)`.

## Options

| Option           | Type                     | Default | Description                                   |
| ---------------- | ------------------------ | ------- | --------------------------------------------- |
| `site`           | `string`                 | baseUrl | The left field of the line.                   |
| `sections`       | `Record<string, number>` | `{}`    | Slug prefix to manual section.                |
| `defaultSection` | `number`                 | `7`     | The section of a page that no prefix matches. |
| `links`          | `Record<string, string>` | `{}`    | Label to URL, listed under the line.          |

## Build

`node plugins/build.mjs footer` from the repository root. `dist/` is committed.
