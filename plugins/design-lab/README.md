# @tplant/design-lab

**Preview only. Do not ship.** A panel, fixed to the bottom right of every
page, that switches between design variants so that they can be compared on
real pages:

- Paper (light mode): greenbar, white with green ink, white with grey ink
- Night (dark mode): ink black, night paper, warm black, forest green
- Typeface: Vollkorn, Titillium Web
- Layout: book, plain

Each choice sets a `data-*` attribute on the root element and is kept in
`localStorage`. The variants themselves are in `quartz/styles/lab.scss`.

To settle the design: copy the chosen tokens from `lab.scss` into
`quartz.config.yaml` and `quartz/styles/custom.scss`, then remove this plugin,
its entry in `quartz.config.yaml`, `lab.scss`, its two lines in `custom.scss`,
and the Titillium Web files in `quartz/static/fonts`.
