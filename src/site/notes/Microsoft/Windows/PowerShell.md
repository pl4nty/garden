---
{"dg-publish":true,"permalink":"/microsoft/windows/power-shell/","updated":"2024-09-11T23:35:23.215+10:00"}
---

[Splatting with overload](https://beatcracker.wordpress.com/2014/12/01/splatting-and-mandatory-parameters/)

```PowerShell
Connect-PnPOnline -Url [tenant].sharepoint.com -Interactive -LaunchBrowser
```

```PowerShell
Import-Module Microsoft.Online.SharePoint.PowerShell -UseWindowsPowerShell
```

```PowerShell
$data = Invoke-MgGraphRequest -Uri "dummy" -Method GET -OutputType HttpResponseMessage
$data.RequestMessage.Headers.Authorization.Parameter
```

## NuGet
`Install-Package` doesn't handle dependencies
`Add-Type -Path` can load DLLs though, if the method signatures are supported by PowerShell

[Import-Package](https://github.com/pwsh-cs-tools/Import-Package) is lesser-known and very useful