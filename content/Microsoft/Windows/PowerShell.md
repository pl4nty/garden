---
{"dg-publish":true,"permalink":"/microsoft/windows/power-shell/","updated":"2024-09-12T00:01:15.710+10:00"}
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

## SQLite

```powershell
Import-Package Microsoft.Data.Sqlite -Verbose
$client = New-Object Microsoft.Data.Sqlite.SqliteConnection -ArgumentList "Data Source=db.sqlite" # ::new() fails
$client.Open()

$cmd = $client.CreateCommand()
$cmd.CommandText = "CREATE TABLE test (foo TEXT)"
$cmd.ExecuteNonQuery()
$cmd.Dispose()

$cmd.CommandText = "INSERT INTO test (foo) VALUES ('bar')"
$cmd.ExecuteNonQuery()
$cmd.Dispose()

$cmd.CommandText = "SELECT * FROM test"
$reader = $cmd.ExecuteReader()
while ($reader.Read()) {
	Write-Host $reader.GetString(0)
}

# $client.Close() isn't enough to unlock the db
```