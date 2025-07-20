---
dg-publish: true
---
Sometimes one of my ideas coalesces into a nice, well-defined unit. Better to end up here than abandoned in the far corners of my memory.
Outcomes required, but "just for fun" is as valid as any. Feasibility: optional. Inspired by [Jacky's list](https://jzhao.xyz/thoughts/idea-list)
## Technical
Automatic Docker packaging
* Inspired by a [David Fowler tweet](https://x.com/davidfowl/status/1880714530390786268) about lang support for compile to Docker
* Tons of prior art. I've toyed with Microsoft's (formerly opensource) Kudu, but plenty of modern approaches like Heroku/Replit/etc
	* `docker init` is closed source and lang support appears limited
	* https://github.com/flexstack/new-dockerfile but it's just lang-specific string templating and no cache volumes :(
* What's the value of this vs webassembly long-term?
	* wasm containerd interop looks pretty great these days, maybe turn this into a blog post on lang support?
	* could use quasi-esolangs (at least in cloudnative) like R

Endless blog updates
* somewhere between https://yossarian.net/ and https://jzhao.xyz/
* https://quartz.jzhao.xyz/showcase
* https://github.com/theacodes/kicanvas
* https://www.byran.ee/posts/creation
* wish I could draw https://www.chloeyan.me/digital-spaces

Web app to search for proactive remediations

Web app analyse Intune diagnostic logs
* errors
* timeline
* convert IDs to names (without Graph?)
* upload file or paste link
* automatically poll for logs and ingest when received?
* https://github.com/petripaavola/Get-IntuneManagementExtensionDiagnostics/
* https://github.com/EricZimmerman/evtx
* LLM and human context to suggest remediations?

Structured microcontroller data
* Datasheets suck
* Start with pinout search, for identifying unknown chips?
* PDF parser, LLM-based? Unsure of volume
* Datasheet sources: digikey, manual upload, popular manufacturers?

k8s gateway API kubebuilder plugin? based on [cilium](https://github.com/cilium/cilium/blob/ec8e005fcb38d56112c054b3ce4668f65d3b4184/operator/pkg/gateway-api/gatewayclass.go) and https://github.com/caddyserver/gateway (patched cilium)

Cursed highspeed [LattePanda Mu](https://www.dfrobot.com/kit-004.html)adapter
* Running 3 architectures in one cluster is insane
* Could we run Windows amd+arm as well? Surely cloud is more sensible
* Quoted 800 USD on fiverr for design, should work my way up I think. maybe something high-speed that's less expensive

Flex pcb and colour? 

Send eBay find to hexf/thomas

Azure BIOS password management service
* generate passwords service-side, and fail open. polling is necessary anyway for rotation
* function to auth Intune client certs
* function to retrieve secrets from KV or create secrets for new devices
* tag secrets with last sync time?

Host a [Roughtime](https://datatracker.ietf.org/doc/draft-ietf-ntp-roughtime/13/) server

Build a [KDC proxy](https://x.com/awakecoding/status/1893467036698710245) lab with client certificate authn

Fix ASPI feeds, regex + bypass cloudflare
https://www.aspi.org.au/rss/news.rss
https://www.aspi.org.au/rss/reports.rss
https://www.aspi.org.au/rss/opinions.rss
https://www.aspi.org.au/rss/reports.rss

Add Process ID to Get-Service https://old.reddit.com/r/dotnet/comments/1jcot21/net48_net80_experience/mi6tkpn/

Automate source extraction from js + sourcemaps https://github.com/unblu/js-source-extractor

Move Obsidian out of OneDrive?

Hunt for Edge CLI args https://github.com/beverloo/peter.sh/blob/master/services/services/command-line-flags/CommandLineFlags.php#L376
https://textslashplain.com/2022/01/05/edge-command-line-arguments/

Concurrent local agents on feature branches using `git worktree`
* VSCode support?
* Dependencies - features like [pnpm workspaces](https://pnpm.io/workspaces)
* Testing - conflicting ports