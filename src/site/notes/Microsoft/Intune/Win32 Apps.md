---
{"dg-publish":true,"permalink":"/microsoft/intune/win32-apps/","updated":"2024-08-23T23:05:25.000+10:00"}
---

## Format

Intune Win32 apps use a proprietary Windows app packaging format, based on a zip file containing
* `Contents/example.intunewin` an encrypted blob
* `Metadata/Detection.xml`

```xml
<ApplicationInfo xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ToolVersion="1.8.4.0">
  <Name>example</Name>
  <UnencryptedContentSize>36428</UnencryptedContentSize>
  <FileName>example.intunewin</FileName>
  <SetupFile>example.exe</SetupFile>
  <EncryptionInfo>
    <EncryptionKey>S5WngPgeoCriP/5apwOM+YoT7FbvTdAr7Zk5O2Gxpok=</EncryptionKey>
    <MacKey>mSxSvC1IEMd9hq1kUEFD9RoqYsAxMXK/JepQLnaG4sk=</MacKey>
    <InitializationVector>jyog5HevmZwPtl+7EnKSzA==</InitializationVector>
    <Mac>IPjZ90cPESSKGHTSsa63xnWazq5XicmNF10oJek0FKA=</Mac>
    <ProfileIdentifier>ProfileVersion1</ProfileIdentifier>
    <FileDigest>98lgpOwsk0PFUuxaPixwTkml/bI94o4m8KIe2WE4VD8=</FileDigest>
    <FileDigestAlgorithm>SHA256</FileDigestAlgorithm>
  </EncryptionInfo>
</ApplicationInfo>
```

### Download

When installation is triggered, the Intune Management Extension retrieves `EncryptionInfo` along with the blob's download URL and Delivery Optimization `FileId` from an Intune sidecar service.
The download URL is likely Azure Blob Storage fronted by Azure CDN, and doesn't need authentication since the blob is encrypted.

I ported the content metadata retrieval to a PowerShell script, and it can be used with Oliver Kieselbach's [IntuneWinAppUtilDecoder.exe](https://github.com/okieselbach/Intune/raw/master/IntuneWinAppUtilDecoder/IntuneWinAppUtilDecoder/bin/Release/IntuneWinAppUtilDecoder.exe) to download and decrypt any Intune app.

```ps1
<#
.SYNOPSIS
Get content information for an Intune Win32 application
Author: Tom Plant <tom@tplant.com.au>

.LINK
https://garden.tplant.com.au

.EXAMPLE
Get-IntuneWin32ContentInfo.ps1 -ApplicationId 00000000-0000-0000-0000-000000000000

.EXAMPLE
$data = Get-IntuneWin32ContentInfo.ps1 -ApplicationId 00000000-0000-0000-0000-000000000000
Invoke-WebRequest $data.ContentInfo.UploadLocation -OutFile app.intunewin.bin
.\IntuneWinAppUtilDecoder.exe app.intunewin.bin /s /key:$($data.DecryptInfo.EncryptionKey) /iv:$($data.DecryptInfo.IV)

Download and decrypt an application in the working directory. Requires IntuneWinAppUtilDecoder.exe
#>

[cmdletbinding()]
param(
  # GUID of the Win32 app. Can be found by opening the app in the Intune portal, and copying the GUID in the URL eg 00000000-0000-0000-0000-000000000000 from https://intune.microsoft.com/#view/Microsoft_Intune_Apps/SettingsMenu/~/0/appId/00000000-0000-0000-0000-000000000000
  [parameter(ValueFromPipeline, Mandatory)][guid]$ApplicationId,
  # Intune device certificate with a private key. Defaults to the current device's certificate. Not recommended, pulling the key with Mimikatz is much easier said than done
  [System.Security.Cryptography.X509Certificates.X509Certificate2]$Certificate,
  [switch]$IsUSGov,
  [uri]$Environment = "https://manage.microsoft.com"
)

begin {
  if ($IsUSGov) {
    $Environment = "https://manage.microsoft.us"
  }

  if (!$Certificate) {
    Write-Verbose "Defaulting to device certificate"
    #Requires -RunAsAdministrator
    $Certificate = Get-Item Cert:\LocalMachine\My\* | Where-Object Issuer -eq "CN=Microsoft Intune MDM Device CA"
  }

  [System.Reflection.Assembly]::LoadWithPartialName("System.Security") | Out-Null

  function Unprotect-EncryptedMessage([xml]$Message) {
    $envelopedCms = New-Object Security.Cryptography.Pkcs.EnvelopedCms
    $envelopedCms.Decode([System.Convert]::FromBase64String($Message.EncryptedMessage.EncryptedContent))
    $envelopedCms.Decrypt()
    return [System.Text.Encoding]::UTF8.GetString($envelopedCms.ContentInfo.Content)
  }
}
process {
  $discovery = Invoke-RestMethod "$Environment/RestUserAuthLocationService/RestUserAuthLocationService/Certificate/ServiceAddresses" -Certificate $Certificate

  $body = @{
    RequestPayload     = @{
      CertificateBlob    = [System.Convert]::ToBase64String($Certificate.RawData)
      ApplicationId      = $ApplicationId # ApplicationName parameter isn't sufficient
      ApplicationVersion = 1
    } | ConvertTo-Json -Compress
    RequestContentType = "GetContentInfo"
    ClientInfo         = @{
      OperatingSystemVersion = "10.0.22631" # only required for Delivery Optimization (ContentInfo.DoFileId)
      SideCarAgentVersion    = "1.81.107.0"
    } | ConvertTo-Json -Compress
    Key                = "00000000-0000-0000-0000-000000000000"
    SessionId          = "00000000-0000-0000-0000-000000000000"
  } | ConvertTo-Json
  
  $uri = "$(($discovery.Services | Where-Object ServiceName -eq SideCarGatewayService).Url)/SideCarGatewaySessions('00000000-0000-0000-0000-000000000000')%3Fapi-version=1.5"
  $data = Invoke-RestMethod -Uri $uri -Method Put -Headers @{Prefer = "return-content" } -ContentType "application/json" -Body $body -Certificate $Certificate
  
  $data = $data.ResponsePayload | ConvertFrom-Json
  $data.ContentInfo = $data.ContentInfo | ConvertFrom-Json
  $data.DecryptInfo = Unprotect-EncryptedMessage([xml]$data.DecryptInfo) | ConvertFrom-Json
  return $data
}
```
