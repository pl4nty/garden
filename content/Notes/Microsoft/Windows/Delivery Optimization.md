---
dg-publish: true
---
An HTTP downloader with peer-to-peer and cache server capabilities. It uses a global control plane with content-based addressing and fallback to URL-based addressing.

## Cache servers
Microsoft Connected Cache (formerly Delivery Optimization In-Network Cache aka DOINC) 

There are currently two types of on-premises cache servers
* Standalone: nginx on Azure Edge for Linux on Windows (EFLOW), targeted at ISPs or cloud-only environments
* SCCM Distribution Point: IIS on Windows
Both appear to be orchestrated by .NET services, but the standalone one can operate as a single container.

Cache servers are accessed with
`http://<CacheServerIP>/<path>?cacheHostOrigin=<hostname>` and can be tested with `/mscomtest/wuidt.gif?cacheHostOrigin=au.download.windowsupdate.com`

## Cloud service

This [first-party doc](https://learn.microsoft.com/en-us/windows/deployment/do/delivery-optimization-workflow#delivery-optimization-service-endpoint-and-data-information) has a helpful explanation of control plane services. Besides that, I've only found [one prior work](https://remyhax.xyz/posts/do-harm/) on the Delivery Optimization P2P protocol (Swarm) and control plane. Content can be queried with

```pwsh
$Geo = irm "https://geo.prod.do.dsp.mp.microsoft.com/geo"
$KeyValue = irm $geo.KeyValue_EndpointFullUri
$ContentPolicy = irm "$($KeyValue.ContentPolicy_EndpointUri)/content/<contentId>/contentpolicy?altCatalogId=<url>"
```

`$KeyValue.Client_RegisteredCallersFilterList` has an interesting list too. `MLModelDownloadJob` is likely related to [[Core AI Platform|Core AI Platform]].

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
Microsoft Store traffic is cached, and encrypted Intune [[Win32 Apps|Win32 Apps]] too. They use Azure Storage fronted by a CDN like http://swdd02-mscdn.manage.microsoft.com/6ecd274d-26f9-49e2-b29c-60a001eaa538/2c9f680a-1d14-4b9c-9dde-868f4aa488bd/31e53840-fa0f-474c-870e-5169ce97380b.intunewin.bin
Tenant ID isn't part of the URL, but app ID is. I forget the exact part.

When downloading a win32 app, the Intune Management Extension retrieves content metadata from the Intune service, which includes an `UploadLocation` of the encrypted intunewin and a `DoFileId` which is the DO `ContentId`. The `ContentId` incorporates Intune metadata like tenant/app/instance, unlike other IDs which appear to be deterministic. #TODO what's the algo?

![[Pasted image 20240625141005.png|Pasted image 20240625141005.png]]

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
## Local service
Delivery Optimization has a [win32 API](https://learn.microsoft.com/en-us/windows/win32/api/deliveryoptimization/) used by the winget CLI, which is the only official [public Delivery Optimization client implementation](https://github.com/microsoft/winget-cli/blob/master/src/AppInstallerCommonCore/DODownloader.cpp) that I'm aware of. But I want to allow arbitrary endpoints, and their implementation uses C++ so I couldn't just patch their code.

I tried [Vanara.PInvoke.DOSvc](https://www.nuget.org/packages/Vanara.PInvoke.DOSvc/) for PowerShell interop, but its signatures weren't compatible with direct loading. Wrapping in a module didn't work either due to some implementation bugs. These were likely regressions because there was an old unit test, but I couldn't fix all of them. They've now been fixed in a pre-release version.

After more digging I found [DODownloaderDotNet](https://github.com/shishirb-MSFT/DODownloaderDotNet) by [Shishir Bhat](https://github.com/shishirb-MSFT), which looks like a sample CLI tool in C# for Microsoft IT. It was pretty easy to patch and publish to PowerShell gallery.

```powershell
Install-Module PSDODownloader
Get-DORequests
Invoke-DORequest -Uri http://dl.delivery.mp.microsoft.com/filestreamingservice/files/52fa8751-747d-479d-8f22-e32730cc0eb1 -OutFile download.exe
```

#TODO lookup error messages on https://github.com/microsoft/win32metadata/blob/main/generation/WinSDK/RecompiledIdlHeaders/um/deliveryoptimizationerrors.h

```powershell
Update-MarkdownHelp .\docs
New-ExternalHelp .\docs -OutputPath . -Force
```

```ini
Windows Registry Editor Version 5.00

[HKEY_USERS\S-1-5-20\Software\Microsoft\Windows\CurrentVersion\DeliveryOptimization]
"Migrated"=dword:00000001
"RequestInfoType"=dword:00000000

[HKEY_USERS\S-1-5-20\Software\Microsoft\Windows\CurrentVersion\DeliveryOptimization\Config]
"KVFileExpirationTime"=hex(b):a6,4d,dc,c8,80,ec,da,01
"Geo_EndpointFullUri"="https://geo.prod.do.dsp.mp.microsoft.com/geo"
"GeoVersion_EndpointFullUri"="https://geover.prod.do.dsp.mp.microsoft.com/geoversion"
"PrivateRegMigrate"=dword:00000001

[HKEY_USERS\S-1-5-20\Software\Microsoft\Windows\CurrentVersion\DeliveryOptimization\Settings]
"DownloadMode"=dword:00000003
"DownloadModeProvider"=dword:00000008

[HKEY_USERS\S-1-5-20\Software\Microsoft\Windows\CurrentVersion\DeliveryOptimization\Trace]

[HKEY_USERS\S-1-5-20\Software\Microsoft\Windows\CurrentVersion\DeliveryOptimization\Usage]
"UploadMonthlyInternetBytes"=hex(b):75,f9,67,0f,00,00,00,00
"UploadMonthlyLanBytes"=hex(b):95,a7,6a,04,00,00,00,00
"DownloadMonthlyInternetBytes"=hex(b):38,9e,77,0f,00,00,00,00
"DownloadMonthlyLanBytes"=hex(b):00,00,00,00,00,00,00,00
"DownloadMonthlyLinkLocalBytes"=hex(b):00,00,00,00,00,00,00,00
"DownloadMonthlyCdnBytes"=hex(b):43,1f,ef,3b,00,00,00,00
"DownloadMonthlyCacheHostBytes"=hex(b):00,00,00,00,00,00,00,00
"DownloadMonthlyGroupBytes"=hex(b):00,00,00,00,00,00,00,00
"DownloadMonthlyRateFrBps"=hex(b):77,3e,20,00,00,00,00,00
"DownloadMonthlyRateBkBps"=hex(b):60,4d,9e,00,00,00,00,00
"DownloadMonthlyRateFrCnt"=dword:00000002
"DownloadMonthlyRateBkCnt"=dword:00000004
"MonthID"=dword:00000008
"SwarmCount"=dword:00000002
"CacheSizeBytes"=hex(b):38,9e,56,03,00,00,00,00
"PeerInfoCount"=dword:00000000
"CDNConnectionCount"=dword:00000000
"LANConnectionCount"=dword:00000000
"LinkLocalConnectionCount"=dword:00000000
"GroupConnectionCount"=dword:00000000
"InternetConnectionCount"=dword:00000000
"DownlinkBps"=dword:00000000
"DownlinkUsageBps"=dword:00000000
"UplinkBps"=dword:00000000
"UplinkUsageBps"=dword:00000000
"FrDownloadRatePct"=dword:0000005a
"BkDownloadRatePct"=dword:0000002d
"UploadRatePct"=dword:00000064
"MonthlyUploadRestriction"=dword:00000000
"UploadCount"=dword:00000001
"PriorityDownloadCount"=dword:00000000
"PriorityDownloadPendingCount"=dword:00000000
"NormalDownloadCount"=dword:00000000
"NormalDownloadPendingCount"=dword:00000000
"CPUpct"="6.415663"
"MemoryUsageKB"=hex(b):50,15,00,00,00,00,00,00
"UploadMonthlyGroupBytes"=hex(b):00,00,00,00,00,00,00,00
"UploadMonthlyLinkLocalBytes"=hex(b):00,00,00,00,00,00,00,00
"CacheServerConnectionCount"=dword:00000000
```

WSL can send queries but response won't be routed back, only visible in wireshark

```sh
dig @224.0.0.251 -p 5353 _microsoft_mcc._tcp.local PTR +norecurse +noadflag +noedns
```

![[Pasted image 20240810164420.png|Pasted image 20240810164420.png]]

![[Pasted image 20240810191248.png|Pasted image 20240810191248.png]]

https://geo.prod.do.dsp.mp.microsoft.com/geo?doClientVersion=10.1.0.13&profile=768&callId=2910957318
https://kv501.prod.do.dsp.mp.microsoft.com/all?doClientVersion=10.1.0.13&countryCode=AU&profile=768&CacheId=7

https://geo.prod.do.dsp.mp.microsoft.com/geo
https://geo.int.do.dsp.mp.microsoft.com/geo
https://geo.dev.do.dsp.mp.microsoft.com/geo

https://kv201.int.do.dsp.mp.microsoft.com/all
https://kv501.prod.do.dsp.mp.microsoft.com/all

`Import-Package Vanara.PInvoke.DnsApi`

Content ID is "New CCM for file `_urzLURQ3ufy6RmLGh3MMnnHuHMV8otyXRTEtq9cTt8=`"?
retrieval: CCM discovering for a27b3dc26a92405146358a67d6162fecd0abdf2c

Valid cache sources:
```
1800c322f          char const* const var_150_1 = "DHCP:";
1800c323b          char const* const var_148_1 = "Services:";
1800c3247          char const* const var_140_1 = "Sharding:";   CacheHost control plane response, possibly ISP MCC?
1800c3253          char const* const var_138_1 = "DNS-SD:";
```

Uses [Win32 DnsServiceBrowse function](https://learn.microsoft.com/en-us/windows/win32/api/windns/nf-windns-dnsservicebrowse), so we can test with Vanara's unit tests
https://grouper.ieee.org/groups/1722/contributions/2009/Bonjour%20Device%20Discovery.pdf
`vscode://file/D:\repos\Vanara\UnitTests\PInvoke\DnsApi\DnsApiTests.cs:159`

https://github.com/aatlasis/Pholus





```
location /filestreamingservice/files/c6b8cf6e-335a-4658-be1b-cae7575dd1ed/pieceshash {

                        default_type application/json;

                        return 200 '{"MajorVersion":1,"MinorVersion":0,"HashOfHashes":"example","ContentLength":73473792,"PieceSize":1048576,"Pieces":["YmjR9NM8nlkwrwyd5V8ukvU2tXoqaVLSrZ3NXqRVj7g=","5ohOPKh0s8xV2C8mscOh0/XUngZ4juYMML89ZZrERWE=","+GGb6sTqKmjvuCO0krRZWiPQTY1kU1SUaqagd3jK5DQ=","TPXeo5f/0NjdwJbrR6mZ/KQf1QuC/wwB5wgmHFvoxQs=","mDa/VP2XcuukwdcHDJsFheKtiDooUVI0EacZnczQlRo=","g0D+uxqhyS2SWQbFHDcfCx2m0sN2M2w7kN7Ojz6Hk0I=","gYRJ+/q+295VMI89bK9R1crMLgifS6tEmvDp//u37vM=","vlD6rehwp76yeQqM6AL24WLqDy5kasvWYARfBfCzLMY=","7RHV22P96l3KztUo1xU+G1KajeVLzmXQdbuEu2Z6tpQ=","+zwoTwPpduLgaWgejr4/uoOlj8tUt0RC2j0qDO+N3BM=","cvuKfCTv25puqHS0qujv/DPSAqgKidHgoFa6Ar8+PBo=","Wz92sW54MURr+uHSkuYgcOCWaDhlzNC/bvRNLAyi/fg=","cyjcD53VA1bYPy/MwVt/EFxVyIreykMiMblfs+DscKU=","aM+mxokScgU8d3F82Fzo22F5e0EsN+oSnS0p6Ivnaq0=","OGziKr+5apmsehE7r12XcDSc5koDYsFbmdSMGV7QIPg=","6+mpCrWG+C9B8BlsYnPjrVvzHza7fdIJSF33WE02uns=","8b8WbWQYNBNU3U57dw0tS3B5bQfwPr6HkGX1wIgzpIQ=","PbmMFVezfH0A4TOc4M3fAYgkWEiIWbYCI04aiXir4+U=","5dmlKdMBw+nmdCBP8MXmghElHf+im2psV/zsDAwcFfE=","mvlgTn//kFRjMz+1vZGBUIMJIvlJxPdkH03eLFetJGc=","oxE4JuC9JwFLMMaDcwHvSbgk3rCzCU11tRXVuXe5HfA=","gY2byLZJx+4+iyI/BiKku5ND/NW1ZOSHSqUq4i4aTbQ=","U3+Ah+TRGnBgV7UTM2chvIdsVpsc6kh/JXME7QClCQQ=","lbz8lrfDJwJk4abkVqRDspQPAHJJiNctUIo9sbsRCKE=","Y12oBGGAswlH5qsTXZi6t9b4LQa5oq7M0szEKvRr3Es=","5wZ0XPp+jbMdkLQdp9K9iW69LgD8Lec+hUE0ESYAiFM=","7SUf+HMZTqPmGVaZ3RR2lqYmawPQzzad0IXIFdb0sMo=","jV8PWwZb8TyItX2tz0hRL4ZKEIPrjWAFQxEkCjHiXho=","KIIap8S2Zd7EK2s8TOTdfujTK7J62jLxTtHA6R2umzQ=","1mgRm3lQDM91avEn3p5DbPF9XUO3Gc6CdUNKKyXpwGo=","ttsqFjtJHIhNQz0pmkq16z/dn+ixmMwLQj9AuUk/JZ0=","D0kl8LcBeVfv3CphAH4f4eMnSIpqXi6XoaWmz4UCFJA=","dDPdVDKLeELOxIgtqUF4sq2DfQJJT6ZBm8mjW4QNElo=","7m8MfQzf7SDGOnrnq4/Q8uSusIRGu1WE7seKOyWrDvw=","BG9WmtyOuWus/N0R+vqqyIZ3lPGRI3lu+ieM8USyWzE=","b6xp4J3ZIo7dOMLV3y5Q7Uv8fVrY9s4MBTIhTllWuwI=","BRqU4vlcxdWmXSae/9byx6NAEkHsx3FUjnPIMWKWysg=","3eomRn3yuEetq6zzPuUKdYZtAVB2cOzEAt3zrG59i5w=","cbA956tTOFqtdTVzk1L0LF3OVNR6tkVXs7Yc/ecPeD4=","SWxe0enQFIoIFKZtjM/IkTIG5dHIOULfS0LlYYLBiFk=","JPTkA6qL/+GGcJMl9Q+ohC4FH2Vf6vfcmtflXYb5GwQ=","hZtt1i+HKkVawZz7JPobdbgBjENOql/LlSYulVjJE+0=","r2lp1QUXT287YbIL191+S3VASGVILFSKEQfDskHOTkI=","wWdY3CgjC8PHGdCAws9IpQvP+6zWBEC/ThNNdn2opI8=","ia4iImOcH8zCGkXlwjNZFHbhvPf6mQJRy7CQOTd4bxI=","srpzW+Q8yyIbI3ib/ma6S9wR6DXjLaOMWa9udeCY6+g=","Zw+pSep5cDKSjpT2qbeJ5TZk7Ce7YaoEqFKxm3aah1A=","67kw3MvK8Db6oNUQEqw13ASxRSP5hTO5bmz02ZM1dlQ=","nc+ijVXQoMrIioSXXURSn34CsrvM7lbCOet81sgAjIc=","SiRaZZhJf/3mZgEI8NZvU+V7TmYC3Gx+EvkA7DO21TE=","lDKS3aScvcYrk6h66XDnfbHy9ZEnKR9ZLecPcZr5TpM=","aZwcJ4U6fUnI3ZiW5XU7xturFWBl6v+ofqB4kv4rw8k=","Y5+BoSXA7HPEQscC/zxk4UB7MzeY6KZfis/ITu9u568=","ARGbth2lZW/8ut2kfkFW640bsCkCL7CF2GHkK5a2T/s=","PbI+znebEfB/9snAZOvjkA4mmvV32CTPNa3QBVODmqU=","2AhWLvpuqIOwk5Fy6/eQcEfJHbpf+1e1tpB3L0vTxfY=","Cll3hyelarbr+hfLk79xYnqssAKbN9amMBHjXBv3qEU=","eSyvl8VXOVpumHyEVp2eC0QoNnUVtFpviMb4KOZDT5s=","2evLstu2ADl5x9ffq/XUU2MA+KJyZw42x3yvDqTohJE=","LXZvmZYVW7NpqeWHnZfvs3ru8ClUzGxRzQX7z7T7WRg=","qMFZSZNZfAaawCJG+96AwjkIVepV/OOiI0+XwAQ89og=","3AjfefA5r0U9LjY3f3nOH56wJ72yrwPLfN8jMGwSItE=","JqY46J0OU0opcuQ8jw1ESvSpmot0X5MN++ASU32SJX8=","h28EsMAhvfKYU8p7tJsASWkAJgJr4OT/H0fVA2M5kBU=","WLowcfrfZiKlVslmIhkVRX0DDi/ZLtBGHJRB06HiKqo=","56Ex0ENmE3GU17lFfzBAFlOE1rsn60bP5ESPc9n5omA=","iSUkaa10/K0iWYSAlvroZi1JZVSZZEABctljR+cb3pY=","Lx1L5bSpAYx9BZd5wBhgOyEMvbGNoUTQ7i+3SqEb9q8=","GRfMlAlW0vqTez8lMGcSkiJCC0Wos8urKuE3sR/sftk=","ebc0sYK/0VhkThDtbYgfWygcXiPt3G8V6Ee5Zcz+uvk=","/v8wDGtfMhnOD98823FUqHFauBvizEsfFmpQsbvrdzg="]}';

                    }
```

```
return 200 '{"MajorVersion":1,"MinorVersion":0,"HashOfHashes":"example","ContentLength":34,"PieceSize":1048576,"Pieces":["lwNZmN/ezTZciFrht39kHBSZyfbBHDeqQpS1wosp1DY="]}';
location /filestreamingservice/files/c6b8cf6e-335a-4658-be1b-cae7575dd1ed {
	return 206 'EICAR-STANDARD-ANTIVIRUS-TEST-FILE';
}
```

If mDNS doesn't respond quickly enough, pieceshash will be served from cloud


```
28/08/2024 11:37:12 AM	12308	5028	4	Info	Redirecting to the following URL: http://google.com/	CHttpAgent::_OnRedirect	1128		
28/08/2024 11:37:13 AM	12308	4004	4	Info	Redirecting to the following URL: http://www.google.com/	CHttpAgent::_OnRedirect	1128		
28/08/2024 11:37:13 AM	12308	23044	4	Info	hr: 80d06809, httpCode: 200, errorCount: 0, fileId: 64b11788eb6bc1425010f420fcec34474246e719_TyKInVOD3EqWEUDwvQP8OguE2hJV7bHsEH+y0K0Ag5Q=__1_PHF, sessionId: 8ad60fb8-777b-44aa-8968-f657f3c3b193, url: http://www.google.com/, isHeadRequest: 0, requestOffset: 0, requestSize: 0, responseSize: 20502, serverIp: [2404:6800:4006:80f::2004]:80;, headers: HTTP/1.1 200 OK
Cache-Control: private, max-age=0
Date: Wed, 28 Aug 2024 11:37:09 GMT
Content-Type: text/html; charset=ISO-8859-1
Expires: -1
P3P: CP="This is not a P3P policy! See g.co/p3phelp for more info."
Server: gws
Set-Cookie: AEC=AVYB7col-Fwtq76xvMhKNXDdBGEL997IE9sS9d3pn4zR9fxerpfBBHMx8xc; expires=Mon, 24-Feb-2025 11:37:09 GMT; path=/; domain=.google.com; Secure; HttpOnly; SameSite=lax
Set-Cookie: NID=517=xrUygJtaax0BXaPl3cUT8iglc1OqRsvRjhBdPHI-YI0tD9SBXBnAQCLITTZiKL-SClTEM7uWHh7kc7eyStVjpPhy638krCvfs5Flz-EtIIN1almoOpPQ3GZxB6KUU7UGNElSC5a3XyDJBKH1MB-3YyijrkShJFczgEblr3DRGAAqSa3lA0Ey1FM1; expires=Thu, 27-Feb-2025 11:37:09 GMT; path=/; domain=.google.com; HttpOnly
…	CTelemetryLogger::TraceErrorCdnComm	975		

```

WinHTTP implementation, uses Windows LEDBAT [LEDBAT Background Data Transfer for Windows - Microsoft Community Hub](https://techcommunity.microsoft.com/t5/networking-blog/ledbat-background-data-transfer-for-windows/ba-p/3639278)
[Winsock IOCTLs (Winsock2.h) - Win32 apps | Microsoft Learn](https://learn.microsoft.com/en-us/windows/win32/winsock/winsock-ioctls#sio_set_priority_hint-opcode-setting-i-t3)


```cpp
if (code < HTTP_STATUS_REDIRECT_METHOD + 1) {
  if (code != HTTP_STATUS_REDIRECT_METHOD) {
	if (((((code == HTTP_STATUS_OK) || (code == HTTP_STATUS_OK + 1)) ||
		 (code == HTTP_STATUS_ACCEPTED)) ||
		((code == HTTP_STATUS_PARTIAL || (code == HTTP_STATUS_NO_CONTENT)))) ||
	   (code == HTTP_STATUS_PARTIAL_CONTENT)) {
	  return 0;
	}
	if (((code != HTTP_STATUS_AMBIGUOUS) && (code != HTTP_STATUS_MOVED)) &&
	   (code != HTTP_STATUS_REDIRECT)) {
	  return -0x7fe6ffff;
	}
  }
  return -0x7fe6fffd;
}
```

What is `IsServicesContentVerificationEnabled` and the `DO-Timestamp`, `DO-Content-Sig` header?

Undocumented `SOFTWARE\Policies\Microsoft\Windows NT\DNSClient\EnableMDNS`



## Content
[Find files in Windows 11, version 23H2 (22631.4037) amd64 - UUP dump](https://uupdump.net/findfiles.php?id=b81608e0-6b51-4771-affc-ce14dba2ca83)

https://learn.microsoft.com/en-us/windows/deployment/do/delivery-optimization-workflow#delivery-optimization-service-endpoint-and-data-information


How'd I come in? troubleshooting printers and mDNS/IPP
Defender logs - weird requests. hold on a second...

but I thought MCC was configured by admin? MCC docs screenshot
nope lol. wireshark screenshot. add to download flow diagram

serve arbitrary content... 
* blackhole `dl.delivery.mp.microsoft.com` otherwise it might load before cache
* pieceshash - failes 
fails hash check. that would've been too easy.

see what's downloaded. what does DO download? docs screenshot

snoop on apps/devices/patches. PoC for finding Windows version, Windows downgrade attacks from defcon? IPv6 vuln?

slow loris style? delay download so we can exploit in background

Intune... but it's encrypted. lob apps too? 
wait a minute - earlier we said msft control content. but Intune is arbitrary* data...

DO payloads typically bypass IPS/IDS for performance reasons, and the service will write data to disk 

greetz
* remy
* jthvai
* goggan

```d2
local network: {
  device1: "" {
    icon: https://icons.terrastruct.com/azure%2FCompute%20Service%20Color%2FVM%2FVM-windows.svg
  }
  device2: "" {
    icon: https://icons.terrastruct.com/azure%2FCompute%20Service%20Color%2FVM%2FVM-windows.svg
  }
  device3: "" {
    icon: https://icons.terrastruct.com/azure%2FCompute%20Service%20Color%2FVM%2FVM-windows-non-azure.svg
  }
  device1 -> device3: pieces {style.animated: true}
  device2 -> device3: pieces {style.animated: true}
}

cloud: regional services {
  KeyValue\nservice/config discovery
  Content Policy\n+ PHF URL + HashOfHashes
  Discovery\npeer grouping
  Arrays\npeer discovery
}

Geo: "region discovery" {
  near: center-right
}
# Geo.shape: cloud
Geo -> local network.device3 <-> cloud

CDN: {
  # shape: cloud
  icon: https://icons.terrastruct.com/azure%2FNetworking%20Service%20Color%2FCDN%20Profiles.svg
}

CDN -> local network.device3: "      Pieces Hash File (PHF)\n + pieces" {
  style.animated: true
}

# github: {
#   icon: https://icons.terrastruct.com/dev/github.svg
#   dev
#   master: {
#     workflows
#   }

#   dev -> master.workflows: merge trigger
# }

# github.master.workflows -> aws.builders: upload and run

# aws: {
#   builders -> s3: upload binaries
#   ec2 <- s3: pull binaries

#   builders: {
#     icon: https://icons.terrastruct.com/aws/Developer%20Tools/AWS-CodeBuild_light-bg.svg
#   }
#   s3: {
#     icon: https://icons.terrastruct.com/aws/Storage/Amazon-S3-Glacier_light-bg.svg
#   }
#   ec2: {
#     icon: https://icons.terrastruct.com/aws/_Group%20Icons/EC2-instance-container_light-bg.svg
#     link: layers.ec2
#   }
#   builders -> builders
# }

# local.code -> aws.ec2: {
#   style.opacity: 0.0
# }

# layers: {
#   ec2: {...@ec2}
# }

# scenarios: {
#   hotfix: {
#     title.label: Hotfix deployment
#     (local.code -> github.dev)[0].style: {
#       stroke: "#ca052b"
#       opacity: 0.1
#     }

#     github: {
#       dev: {
#         style.opacity: 0.1
#       }
#       master: {
#         workflows: {
#           style.opacity: 0.1
#         }
#         style.opacity: 0.1
#       }

#       (dev -> master.workflows)[0].style.opacity: 0.1
#       style.opacity: 0.1
#       style.fill: "#ca052b"
#     }

#     (github.master.workflows -> aws.builders)[0].style.opacity: 0.1

#     (local.code -> aws.ec2)[0]: {
#       style.opacity: 1
#       style.stroke-dash: 5
#       style.stroke: "#167c3c"
#     }
#   }
# }

```