---
dg-publish: true
---
Microsoft's public telemetry service

## Ingest
Previously global endpoints like `dc.applicationinsights.azure.com`, were deprecated in 2025 in favour of regional endpoints like `australiaeast-1.in.applicationinsights.azure.com`.

Unfortunately `.applicationinsights.azure.com` is on one of the default uBlock blocklists. Fortunately, `dc.applicationinsights.microsoft.com` is not, and the deprecation hasn't broken it yet.
I'm guessing Microsoft have a ton of legacy thick clients that'll keep sending data for a while.
Proxying `example.com/v2/track` to a regional endpoint also works,  and it's probably more reliable long-term.