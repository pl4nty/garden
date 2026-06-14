# socials

A small local Quartz component plugin that renders a row of social/link icons,
intended for the top-left sidebar (under the page title).

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
        Status: https://status.tplant.com.au/
    layout:
      position: left
      priority: 15
```

Each entry is `Label: URL`. The label (lowercased) selects a built-in icon —
`github`, `linkedin`, `homelab`, `status`. Unknown labels render as text.

## Maintenance

Like the sibling `footer` plugin, the compiled output in `dist/` is what Quartz
loads at runtime (it uses the prebuilt `dist/` and does not rebuild). When
editing `src/`, keep `dist/` in sync.
