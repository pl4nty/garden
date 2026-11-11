# @tplant/light

The light of the site. Three things in one plugin:

- `src/palettes.ts` holds the colours of the garden scene at each time of day
  (night, dawn, morning, midday, afternoon, golden hour, dusk) and blends
  between them for any hour. The page colours in `quartz.config.yaml` are
  taken from its midday and night states.
- `src/light.inline.ts` runs in the browser before the page paints. It sets
  the scene's CSS variables for the visitor's local time, sets Quartz's
  `saved-theme` attribute (dark from dusk to dawn), and keeps both current
  while the page stays open.
- The component is the switch: a button that steps through Auto (follow the
  clock), Day and Night. It replaces Quartz's `darkmode` plugin and stores the
  choice under the same `theme` key.

Without scripting the scene shows its midday state, or its night state when
the system asks for dark. With a system that asks for dark, Auto is night at
any hour. `?t=17.5` in the address shows the light of that hour.

## Example

```yaml
- source: ./plugins/light
  enabled: true
  layout:
    position: left
    priority: 30
    group: toolbar
```

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/`:

```bash
node plugins/build.mjs light
```
