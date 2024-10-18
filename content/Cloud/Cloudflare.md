---
{"dg-publish":true,"permalink":"/cloud/cloudflare/"}
---

## Rocket Loader
Cloudflare's [Rocket Loader](https://developers.cloudflare.com/speed/optimization/content/rocket-loader/) injects a `<script>` into the end of page bodies, which fails to load with certain web security settings and prevents other scripts from loading. I've only seen this happen with [miniflux/v2](https://github.com/miniflux/v2), where it broke all interactive functionality like buttons.

It's easy to turn off for specific sites or paths using [Configuration Rules](https://developers.cloudflare.com/rules/configuration-rules/).

![Pasted image 20240526123830.png](/img/user/Uploads/Pasted%20image%2020240526123830.png)

![Pasted image 20240526124041.png](/img/user/Uploads/Pasted%20image%2020240526124041.png)