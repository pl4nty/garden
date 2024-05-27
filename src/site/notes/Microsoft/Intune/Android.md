---
{"dg-publish":true,"permalink":"/microsoft/intune/android/"}
---

## Emulator
Device emulators are helpful for faster testing iteration and testing sensor inputs. 

I first attempted to use Windows [[Microsoft/Windows/Subsystem for Android\|Subsystem for Android]], and bypassed the region restrictions that block it in Australia. I was able to install Company Portal, but the work profile API was very broken even after I sideloaded its APKs. So I turned to the official [[Hardware/Android\|Android]] SDK.

After installing the Company Portal APK, this snippet was helpful for parsing log exports:
```PowerShell
$file = .\CompanyPortal_0.log
(Get-Content $file -Raw) -replace "`r`n","NEWLINE" -replace "NEWLINE([0-9]{4})","`n`$1" -replace "`t{2,}",";" | Set-Content $file
$data = Import-Csv -Delimiter "`t" -Header "time","level","class","code","code2" $file | % { $_.time=[Datetime]::Parse($_.time); $_ }
$data | group class -NoElement | sort count | fl
```
## Teams Rooms and Phones
Teams devices run a few Teams management apps, which orchestrate Company Portal and vendor apps.

They distribute APKs via `devicemgmt-cdn.teams.microsoft.com`, which doesn't support [[Microsoft/Windows/Delivery Optimization\|Delivery Optimization]] and the DO product team advised Android support wasn't planned. The APK CDN is Azure Front Door so it [doesn't support ExpressRoute](https://github.com/MicrosoftDocs/azure-docs/issues/99941#issuecomment-1376692620) either, even though `*.teams.microsoft.com` is on the ExpressRoute endpoints list.