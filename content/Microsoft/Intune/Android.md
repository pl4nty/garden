---
dg-publish: true
---
## Emulator
Device emulators are helpful for faster testing iteration and testing sensor inputs. 

I first attempted to use Windows [[Subsystem for Android|Subsystem for Android]], and bypassed the region restrictions that block it in Australia. I was able to install Company Portal, but the work profile API was very broken even after I sideloaded its APKs. So I turned to the official [[Hardware/Android|Android]] SDK.

After installing the Company Portal APK, this snippet was helpful for parsing log exports:
```PowerShell
$file = .\CompanyPortal_0.log
(Get-Content $file -Raw) -replace "`r`n","NEWLINE" -replace "NEWLINE([0-9]{4})","`n`$1" -replace "`t{2,}",";" | Set-Content $file
$data = Import-Csv -Delimiter "`t" -Header "time","level","class","code","code2" $file | % { $_.time=[Datetime]::Parse($_.time); $_ }
$data | group class -NoElement | sort count | fl
```
## Teams Rooms and Phones
Teams devices run a few Teams management apps, which orchestrate Company Portal and vendor apps.

They distribute APKs via `devicemgmt-cdn.teams.microsoft.com`, which doesn't support [[Delivery Optimization|Delivery Optimization]] and the DO product team advised Android support wasn't planned. The APK CDN is Azure Front Door so it [doesn't support ExpressRoute](https://github.com/MicrosoftDocs/azure-docs/issues/99941#issuecomment-1376692620) either, even though `*.teams.microsoft.com` is on the ExpressRoute endpoints list.

## Work Profiles
Google Wallet doesn't support work profiles, so virtual card apps like Weel need to be installed in the personal profile.

Some apps don't request permission to both profiles, like keyboards, but we can grant it manually with `adb shell pm grant com.touchtype.swiftkey android.permission.INTERACT_ACROSS_USERS`.
Swiftkey specifically has a function to request the permission and sync settings, but it crashes on Android 15. UI was a helpful "oops, something went wrong" and even hidden app logs didn't show a crash... Just successful [CrossProfileSender](https://github.com/google/connectedappssdk/blob/1fdd8460940e8744b8de15fbd2eb80078c3bfc8b/sdk/src/main/java/com/google/android/enterprise/connectedapps/CrossProfileSender.java#L685) logs.