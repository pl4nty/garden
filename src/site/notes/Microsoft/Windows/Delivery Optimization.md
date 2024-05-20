---
{"dg-publish":true,"permalink":"/microsoft/windows/delivery-optimization/"}
---

An HTTP downloader with peer-to-peer and cache server capabilities. It uses a stateless globally-distributed control plane with content-based routing and fallback to URL-based routing.

There are currently two types of cache servers
* Standalone: nginx on Azure Edge for Linux on Windows (EFLOW)
* SCCM Distribution Point: IIS on Windows 
Both appear to be orchestrated by .NET services, but the standalone one can operate as a single container.

Cache servers are accessed with
`http://<CacheServerIP>/<path>?cacheHostOrigin=<hostname>`

This [first-party doc](https://learn.microsoft.com/en-us/windows/deployment/do/delivery-optimization-workflow#delivery-optimization-service-endpoint-and-data-information) has a helpful explanation of control plane services. Besides that, I've only found [one prior work](https://remyhax.xyz/posts/do-harm/) on the Delivery Optimization P2P protocol (Swarm) and control plane. Content can be queried with

```pwsh
$Geo = irm "https://geo.prod.do.dsp.mp.microsoft.com/geo"
$KeyValue = irm $geo.KeyValue_EndpointFullUri
$ContentPolicy = irm "$($KeyValue.ContentPolicy_EndpointUri)/content/<contentId>/contentpolicy?altCatalogId=<url>"
```

`$KeyValue.Client_RegisteredCallersFilterList` has an interesting list too, maybe `MLModelDownloadJob` is related to Germanium.

```
BeginLoadRange.*
.*CheckReachable
DoLoadFile
EdgeUpdate DO Job
IntuneAppDownload
MDMSW Job
Microsoft Component Updater DO Job
Microsoft Office Click-to-Run
MLModelDownloadJob
MSIX HttpsDataSource Download
Msk8sDownloadAgent
Windows Dlp Manager
WSXExperiencePackDownloadJob
WU Client Download
Xbox XVC Streaming
Windows Recovery Media Creator
```

#TODO torrent download tracker? would need a content index though

#TODO proxy control plane traffic for further analysis
<br>
## Intune
Microsoft Store traffic is cached, and encrypted Intune [[Microsoft/Intune/Win32 Apps\|Win32 Apps]] too. They use Azure Storage fronted by a CDN like http://swdd02-mscdn.manage.microsoft.com/6ecd274d-26f9-49e2-b29c-60a001eaa538/2c9f680a-1d14-4b9c-9dde-868f4aa488bd/31e53840-fa0f-474c-870e-5169ce97380b.intunewin.bin
Tenant ID isn't part of the URL, but app ID is. I forget the exact part.

#TODO how is Intune content looked up? can I track it? doesn't seem to work with `altCatalogId`