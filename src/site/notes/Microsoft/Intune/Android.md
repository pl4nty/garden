---
{"dg-publish":true,"permalink":"/microsoft/intune/android/"}
---

## Emulator
Device emulators are helpful for faster testing iteration and simulating sensors. 

I first attempted to use Windows Subsystem for Android, and bypassed the region restrictions that block it in Australia. I was able to install Company Portal, but the work profile API was very broken even after I sideloaded its APKs. So I turned to the official Android SDK.

Install the [Android Studio](https://developer.android.com/studio) commandline tools, then
```PowerShell
.\cmdline-tools\latest\bin\sdkmanager --install "system-images;android-33;google_apis_playstore;x86_64"
.\cmdline-tools\latest\bin\avdmanager create avd --name android33 --package "system-images;android-33;google_apis_playstore;x86_64"
mkdir platforms && mkdir platform-tools
.\emulator\emulator -avd android33 -qemu -m 3000
```

I automated some config
```PowerShell
$config =  "$env:USERPROFILE\.android\avd\android33.avd\config.ini"
(Get-Content $config) -replace 'hw.keyboard .*','hw.keyboard = yes' | Set-Content $config
```

But did these manually
* Dark theme
* Screen size - pixel 5 2340x1080 @ 440ppi
* Screenshot location to pictures instead of desktop

This snipped was helpful for parsing Company Portal log exports
```PowerShell
$file = .\CompanyPortal_0.log
(Get-Content $file -Raw) -replace "`r`n","NEWLINE" -replace "NEWLINE([0-9]{4})","`n`$1" -replace "`t{2,}",";" | Set-Content $file
$data = Import-Csv -Delimiter "`t" -Header "time","level","class","code","code2" $file | % { $_.time=[Datetime]::Parse($_.time); $_ }
$data | group class -NoElement | sort count | fl
```

## Teams Rooms and Phones
Teams devices run a few Teams management apps, which orchestrate Company Portal and vendor apps.

They distribute APKs via `devicemgmt-cdn.teams.microsoft.com`, which doesn't support [[Microsoft/Windows/Delivery Optimization\|Delivery Optimization]] and the DO product team advised Android support wasn't planned. The APK CDN is Azure Front Door so it [doesn't support ExpressRoute](https://github.com/MicrosoftDocs/azure-docs/issues/99941#issuecomment-1376692620) either, even though `*.teams.microsoft.com` is on the ExpressRoute endpoints list.