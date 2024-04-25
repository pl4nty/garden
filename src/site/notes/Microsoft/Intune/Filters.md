---
{"dg-publish":true,"permalink":"/microsoft/intune/filters/"}
---

[u/Satielreks](https://old.reddit.com/r/Intune/comments/1ccdfnq/creating_graph_api_post_request_keeps_kicking) found a Graph endpoint for evaluating [Intune filter](https://learn.microsoft.com/en-us/mem/intune/fundamentals/filters) results, but it's a bit tricky to use with the Graph PowerShell SDK. The endpoint returns the `application/octet-stream` [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) instead of `application/json`, so the SDK [can only write to a file](https://github.com/microsoftgraph/msgraph-sdk-powershell/issues/2088). But we can use `New-TemporaryFile` to manually convert it to a PowerShell object.

```PowerShell
#Requires -Module Microsoft.Graph.Authentication
$rule = '(device.deviceName -eq "test")'
$file = New-TemporaryFile
Invoke-MgGraphRequest -Uri "beta/deviceManagement/evaluateAssignmentFilter" -Method POST -Body @{data=@{platform="Windows10AndLater"; rule=$rule}} -OutputFilePath $file
$data = Get-Content $file | ConvertFrom-Json -Depth 100
```