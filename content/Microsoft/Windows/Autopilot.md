---
dg-publish: true
---
Windows Autopilot is Microsoft's Out-Of-Box-Experience (OOBE) enrollment method for MDMs like Intune.

## Hardware hashes

Autopilot v1 uses hardware hashes to determine whether a device is managed, which must be uploaded to the service before enrollment.
Devices can automatically upload their hash if managed by Intune, or via an SCCM integration, but what if they're not using those?
One option is using PowerShell to generate the hash and upload as a CSV. But one CSV per device is painful at scale - let's build a better option.

We can upload the hashes to a staging environment like Azure Storage, then upload them to Autopilot. Autopilot limits them to batches of 500, but that's better than one at a time.
For easy bulk export to CSV via Azure Storage Explorer, we can use Azure Table storage, keyed by tenant ID and serial number for easy filtering and deduplication.

Microsoft provide modules for hash generation and Azure table access, but installing PowerShell modules (or packaging them) can be painful.
Here's a zero-dependency script to upload a device's hash using a shared key for authentication.

When exporting to CSV, make sure to rename the columns before uploading to Autopilot. Replace the underscores with spaces - Azure Tables doesn't allow spaces in column names.

```powershell
<#
.SYNOPSIS
Upload the device's Autopilot hardware hash to Azure table storage.
.EXAMPLE
Table storage
Export-AutopilotHashToAzure.ps1 -TenantId d77c3d82-e0f1-42d9-9d10-d2f2811cd16a -Storage "https://example.table.core.windows.net/autopilothashes?sv=2017-07-29&tn=autopilothashes&sig=<snip>"
.EXAMPLE
Table storage with group tag
Export-AutopilotHashToAzure.ps1 -GroupTag myGroup -TenantId d77c3d82-e0f1-42d9-9d10-d2f2811cd16a -Storage "https://example.table.core.windows.net/autopilothashes?sv=2017-07-29&tn=autopilothashes&sig=<snip>"
#>
[cmdletbinding()]
param(
  # Azure blob SAS URL.
  [parameter(Mandatory)]
  [System.UriBuilder]$Storage,

  # Tenant ID.
  [parameter(Mandatory)]
  [guid]$TenantId,

  # Group tag.
  [string]$GroupTag
)
$session = New-CimSession
$serial = Get-CimInstance -CimSession $session -ClassName Win32_BIOS | Select-Object -ExpandProperty SerialNumber
$hash = Get-CimInstance -CimSession $session -Namespace root/cimv2/mdm/dmmap -Class MDM_DevDetail_Ext01 -Filter "InstanceID='Ext' AND ParentID='./DevDetail'" | Select-Object -ExpandProperty DeviceHardwareData

$Storage.Path += "(PartitionKey='$TenantId', RowKey='$serial')"
$body = @{
  "Device_Serial_Number" = $serial
  "Windows_Product_ID"   = ""
  "Hardware_Hash"        = $hash
}
if ($GroupTag) {
  $body.Group_Tag = $GroupTag
}
Invoke-RestMethod -Method PUT -Uri $Storage.Uri -Body $body -Headers @{
  "x-ms-version" = "2025-01-05"
  "Accept"       = "application/json;odata=nometadata"
} -ContentType "application/json"
```
