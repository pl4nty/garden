# @tplant/small-caps

A transformer that sets acronyms in note bodies in small caps, as a printed
book does, so that a paragraph about ADMX, CTFs and NSGs does not shout.

It wraps each run of two or more capitals (with an optional plural `s`) in
`<abbr class="sc">`. The theme styles `.sc` with `font-variant-caps:
all-small-caps`, which uses the `c2sc` feature of the self-hosted Vollkorn. The
text is not changed, so copy, search and screen readers still get "CTF".

Text inside `code`, `pre`, `kbd`, `samp`, `svg` and `math` is left alone.

Titles in the nav, the homepage lists and the notes index get the same
treatment from `../shared/smallCaps.tsx`.

## Building

`dist/` is committed, because Quartz loads it at runtime. Rebuild it after an
edit to `src/` or to `../shared`:

```bash
node plugins/build.mjs small-caps
```
