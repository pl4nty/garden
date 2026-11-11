# @tplant/socials

Links that leave the site, for the left column. Each is drawn as a schematic's
global label: a box with a point on one side, the mark for a connection to
somewhere off the sheet.

## Usage

In `quartz.config.yaml`:

```yaml
- source: ./plugins/socials
  enabled: true
  options:
    links:
      GitHub: https://github.com/pl4nty
      LinkedIn: https://www.linkedin.com/in/your-handle
      Homelab: https://lab.tplant.com.au/
  layout:
    position: left
    priority: 32
```

Each entry is `Label: URL`. The label is the text of the link.

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/`:

```bash
node plugins/build.mjs socials
```
