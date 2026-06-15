# @tplant/explorer-tweaks

Behavioural tweaks for the Quartz explorer. The component renders nothing — it
just ships a small client-side script (`afterDOMLoaded`).

## What it does

The remote `quartz-community/explorer` force-opens every folder whose path is a
prefix of the page you're currently viewing, on each SPA navigation. That means
opening a post (for example via a homepage **Featured** link) re-expands its
parent folder in the sidebar tree, even if you'd left it collapsed.

There's no option to turn that off, so this script runs right after the
explorer's own navigation handler and re-collapses any folder that isn't open in
the **saved** state (the manual open/closed choices the explorer persists to
`localStorage` under `fileTree`) or open by default. Folders you opened yourself
stay open; only the active-page auto-expansion is undone.

It's deferred to `requestAnimationFrame`, so the re-collapse lands before the
browser paints — there's no visible open→close flicker.

## Usage

```yaml
- source: ./plugins/explorer-tweaks
  enabled: true
  layout:
    position: body
    priority: 110
    display: all
```

## Building

`dist/` is hand-authored to mirror what `tsup` would emit. Keep it in sync with
`src/` when editing.
