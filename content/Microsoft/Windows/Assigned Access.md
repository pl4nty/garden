---
dg-publish: true
---
[Assigned Access](https://learn.microsoft.com/en-us/windows/configuration/assigned-access/) is a Windows feature that you can use to configure a device as a kiosk or with a restricted user experience.
Steven (Steve) Hosking from msft sydney has worked a ton on it, did talks at workplace ninjas.
Config is pretty complex so it's managed through an XML payload via CSP. The Intune frontend has a GUI but it's based on a pretty old version, so a lot of features aren't available.

The XML schema from the docs is up-to-date, but if it ever changes we can get the latest and its dependencies with `strings C:\Windows\System32\AssignedAccessCsp.dll | select-string "xmlns:xs" | % {$i=0} { $_ | Out-File ./Downloads/AssignedAccessSchemas/$i.xml; $i++ }`.

The taskbar schema can be pulled from `strings C:\Windows\System32\twinui.pcshell.dll | select-string "xmlns:xs" | % {$i=0} { $_ | Out-File ./Downloads/ShellSchemas/$i.xml; $i++ }`, and the start menu schema for Win10. Win11 uses JSON and I can't seem to find a schema.

I went down a rabbit hole hunting for schemas, and ended up finding a ton in windir: [data/uupdump/Client/Windows · pl4nty/data](https://github.com/pl4nty/data/tree/main/uupdump/Client/Windows)
VPN, WLAN, AppLocker, and more. Almost every schema I could need - except
