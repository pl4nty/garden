---
dg-publish: true
---
## Rocket Loader
Cloudflare's [Rocket Loader](https://developers.cloudflare.com/speed/optimization/content/rocket-loader/) injects a `<script>` into the end of page bodies, which fails to load with certain web security settings and prevents other scripts from loading. This happens with [miniflux/v2](https://github.com/miniflux/v2), where it broke all interactive functionality like buttons, and [hedgedoc v1](https://docs.hedgedoc.org/guides/reverse-proxy/#cloudflare) where the UI didn't render.

It's easy to turn off for specific sites or paths using [Configuration Rules](https://developers.cloudflare.com/rules/configuration-rules/).

![[Pasted image 20240526123830.png|Pasted image 20240526123830.png]]

![[Pasted image 20240526124041.png|Pasted image 20240526124041.png]]

## Auto Minify
Auto minify can mangle certain JavaScript dependencies like `feross/buffer`, causing obscure console errors. This breaks [hedgedoc v1](https://docs.hedgedoc.org/guides/reverse-proxy/#cloudflare) but doesn't appear to impact v2. It's deprecated and will be removed on 05/8/2024, but in the meantime it can be disabled with a Configuration Rule.

![[Pasted image 20240623203205.png|Pasted image 20240623203205.png]]


