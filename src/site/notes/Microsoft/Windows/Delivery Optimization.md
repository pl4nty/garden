---
{"dg-publish":true,"permalink":"/microsoft/windows/delivery-optimization/","updated":"2024-06-25T14:28:02.210+10:00"}
---

An HTTP downloader with peer-to-peer and cache server capabilities. It uses a global control plane with content-based addressing and fallback to URL-based addressing.

## Cache servers
Microsoft Connected Cache (formerly Delivery Optimization In-Network Cache aka DOINC) 

There are currently two types of on-premises cache servers
* Standalone: nginx on Azure Edge for Linux on Windows (EFLOW), targeted at ISPs or cloud-only environments
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

`$KeyValue.Client_RegisteredCallersFilterList` has an interesting list too. `MLModelDownloadJob` is likely related to [[Microsoft/Windows/Core AI Platform\|Core AI Platform]].

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

#TODO download tracker? could use https://apps.microsoft.com/api/Reco/GetComputedProductsList?gl=US&hl=en-us&listName=TopFree&pgNo=1&noItems=24&filteredCategories=AllProducts&mediaType=apps as a content index

A group of DO peers (swarm) can be joined with

```
$contentId = "test"
$altCatalogId = "http://tlu.dl.delivery.mp.microsoft.com/filestreamingservice/files/25058c77-27b0-4c38-a174-f86b72f86dc9" # surface
$altCatalogId = "http://tlu.dl.delivery.mp.microsoft.com/filestreamingservice/files/c6b8cf6e-335a-4658-be1b-cae7575dd1ed" # company portal
$Geo = irm "https://geo.prod.do.dsp.mp.microsoft.com/geo?doClientVersion=10.1.0.12"
$KeyValue = irm "$($Geo.KeyValue_EndpointFullUri)?doClientVersion=10.1.0.12"
$ContentPolicy = irm "$($KeyValue.ContentPolicy_EndpointFullUri -replace '{contentId}', $contentId)?altCatalogId=$altCatalogId"
$Arrays = irm "$($KeyValue.Discovery_EndpointFullUri -replace '{contentId}', $contentId)?partitionId=0&CountryCode=US&altCatalogId=$altCatalogId"
# $Swarm = irm "$($Arrays[0].CollectiveArray)join/" -Method POST -Body @{AltCatalogId=$altCatalogId}
# $Swarm
$psObject = $psObject = @{
  # ContentId = "e2797dcfc9adc3d026152f00465e4e04f643675d"
  AltCatalogId = $altCatalogId
  PeerId = "e08e8e26fd833d4097b3a62b66adc67b00000000"
  ReportedIp = "192.168.1.8"
  SubnetMask = "255.255.255.0"
  Ipv6 = "fe80::240c:cca8:88ed:fdce"
  IsBackground = "0"
  ClientDialectVersionMajor = "10"
  ClientDialectVersionMinor = "1"
  ClientDialectVersionBuild = "0"
  ClientDialectVersionRevision = "12"
  Uploaded = "0"
  Downloaded = "0"
  DownloadedCdn = "0"
  DownloadedDoinc = "0"
  Left = "73473792"
  JoinRequestEvent = "1"
  RestrictedUpload = "0"
  PeersWanted = "255"
  GroupId = ""
  Scope = "1"
  # UploadedBPS = "0"
  # DownloadedBPS = "0"
  Profile = "768"
  Seq = "0"
}
$Swarm = irm "$($Arrays[0].CollectiveArray)join/" -Method POST -Body ($psObject | ConvertTo-Json) -ContentType "application/json"

```
<br>
## Intune
Microsoft Store traffic is cached, and encrypted Intune [[Microsoft/Intune/Win32 Apps\|Win32 Apps]] too. They use Azure Storage fronted by a CDN like http://swdd02-mscdn.manage.microsoft.com/6ecd274d-26f9-49e2-b29c-60a001eaa538/2c9f680a-1d14-4b9c-9dde-868f4aa488bd/31e53840-fa0f-474c-870e-5169ce97380b.intunewin.bin
Tenant ID isn't part of the URL, but app ID is. I forget the exact part.

When downloading a win32 app, the Intune Management Extension retrieves content metadata from the Intune service, which includes an `UploadLocation` of the encrypted intunewin and a `DoFileId` which is the DO `ContentId`. The `ContentId` incorporates Intune metadata like tenant/app/instance, unlike other IDs which appear to be deterministic. #TODO what's the algo?

![Pasted image 20240625141005.png](/img/user/Uploads/Pasted%20image%2020240625141005.png)

The DO cloud service only returns data from the content ID, not the URL unlike Store apps, which causes download failures if the ID is null.
```powershell
irm "$($KeyValue.ContentPolicy_EndpointUri)/content/501FCB7D-A970-4E34-A753-4B48FE5D8BEF_6ecd274d-26f9-49e2-b29c-60a001eaa538_03f2334f-03e3-43c8-9db5-24d8979ebafd_fade6ecb-833a-4664-9794-c873ac4734ef-intunewin-bin_a91660a8-1dde-485b-98fa-514e6616d515_1/contentpolicy"

ContentId             : DO-pnfBh6zEGx3sxf6WBId825S6VQpwJTWIaAWU-cBsHD0=
HashOfHashes          : pnfBh6zEGx3sxf6WBId825S6VQpwJTWIaAWU/cBsHD0=
PiecesHashFileCdnUrls : {https://swdd02.manage.microsoft.com/6ecd274d-26f9-49e2-b29c-60a001eaa538/03f2334f-03e3-43c8-9db5-24d8979ebafd/fade6ecb-833a-4664-9794-c873ac4734ef.intunewin.bin.phf}
ContentCdnUrls        : 
IsSecure              : False
IsInternal            : False
Policies              : @{ForegroundQosBps=6710886; BackgroundQosBps=2621440; MaxCacheAgeSecs=86400; ExpireAtSecsSinceEpoch=; DownloadToExpire=86400}
Rank                  : 0
```

The win32 DO API requires both the `ContentId` and `Uri` [despite the documentation](https://learn.microsoft.com/en-us/windows/win32/api/deliveryoptimization/ne-deliveryoptimization-dodownloadproperty#:~:text=required%20only%20if%20DODownloadProperty_ContentId%20isn%27t%20provided), so I had to modify PSDODownloader to support both at once.

[thebabush/wudo-reversing: Windows Update Delivery Optimization reverse engineernig (github.com)](https://github.com/thebabush/wudo-reversing/tree/main)
[Chapter 2 - Black Box Research (sygnia.co)](https://www.sygnia.co/blog/chapter-2-black-box-research/)
[DOing More Harm: Part 2 | REMY HAX](https://remyhax.xyz/posts/do-more-harm/)

#TODO Intune msix testing
## PowerShell
Delivery Optimization has a [win32 API](https://learn.microsoft.com/en-us/windows/win32/api/deliveryoptimization/) used by the winget CLI, which is the only official [public Delivery Optimization client implementation](https://github.com/microsoft/winget-cli/blob/master/src/AppInstallerCommonCore/DODownloader.cpp) that I'm aware of. But I want to allow arbitrary endpoints, and their implementation uses C++ so I couldn't just patch their code.

I tried [Vanara.PInvoke.DOSvc](https://www.nuget.org/packages/Vanara.PInvoke.DOSvc/) for PowerShell interop, but its signatures weren't compatible with direct loading. Wrapping in a module didn't work either due to some implementation bugs. These were likely regressions because there was an old unit test, but I couldn't fix all of them. They've now been fixed in a pre-release version.

After more digging I found [DODownloaderDotNet](https://github.com/shishirb-MSFT/DODownloaderDotNet) by [Shishir Bhat](https://github.com/shishirb-MSFT), which looks like a sample CLI tool in C# for Microsoft IT. It was pretty easy to patch and publish to PowerShell gallery.

```powershell
Install-Module PSDODownloader
Get-DORequests
Invoke-DORequest -Uri http://dl.delivery.mp.microsoft.com/filestreamingservice/files/52fa8751-747d-479d-8f22-e32730cc0eb1 -OutFile download.exe
```


```powershell
Update-MarkdownHelp .\docs
New-ExternalHelp .\docs -OutputPath . -Force
```