---
{"dg-publish":true,"permalink":"/microsoft/hyper-v/","updated":"2024-09-20T18:37:51.637+10:00"}
---

## Networking

The default switch simply uses NAT to provide host network access, but certain firewall rules will break it.
An external switch can bypass the rules using adapter bridging, but has other downsides
* Slow network: try https://superuser.com/a/1375670. Disable coalescing on the WiFi card with `Disable-NetAdapterRSC -Name WiFi`
* Slow upload: disable Large Send Offload on the adapter for the external switch, eg vEthernet (WiFi)

## Image Creation

`Install-Script AutopilotNuke`

[Convert-WindowsImage/Convert-WindowsImage.ps1 at main · x0nn/Convert-WindowsImage (github.com)](https://github.com/x0nn/Convert-WindowsImage/blob/main/Convert-WindowsImage.ps1#L74)
[Windows Autopilot testing with VMs – Out of Office Hours (oofhours.com)](https://oofhours.com/2023/08/23/windows-autopilot-testing-with-vms/)



Regular
```powershell
. .\Convert-WindowsImage.ps1
Convert-WindowsImage -SourcePath .\en-us_windows_11_business_editions_version_23h2_updated_march_2024_x64_dvd_ff6b444c.iso -VHDPath .\en-us_windows_11_business_editions_version_23h2_updated_march_2024_x64_dvd_ff6b444c.vhdx -DiskLayout UEFI -Edition 5 -SizeBytes 64GB -Verbose
```

With kernel debugging (disable secure boot)
```powershell
Convert-WindowsImage -SourcePath .\en-us_windows_11_business_editions_version_23h2_updated_march_2024_x64_dvd_ff6b444c.iso -VHDPath kernel.vhdx -DiskLayout UEFI -Edition 5 -SizeBytes 64GB -EnableDebugger Network -IPAddress 172.21.16.1 -Port 50000 -Key 3u8smyv477z20.2owh9gl90gbxx.3sfsihzgq7di4.nh8ugnmzb4l7 -Verbose
```

Copy to `C:\Users\Public\Documents\Hyper-V\Virtual Hard Disks` and create the VM.

## File Transfer

Enhanced Session Mode is the easiest way to copy files or mount file shares between a host and VM, but it requires RDP permissions on the VM and it's blocked by Remote Credential Guard (commonly enforced by the ACSC Essential Eight).
So we have to find some more creative ways to transfer files.

Host to VM is easy, there's a built-in cmdlet - although it doesn't support relative filepaths. We can fix that.

```powershell
function Copy-VMFileRelative ($VMName, [System.IO.FileInfo]$SourcePath) {
  Copy-VMFile $VMName -FileSource Host -SourcePath $SourcePath -DestinationPath "C:\Users\Public\Downloads\$($SourcePath.Name)" -CreateFullPath
}
```

The cmdlet also has a `-FileSource` parameter which looks like it meant to support VM to host copying. But the only valid parameter is `-FileSource Host`...
At first I tried `New-PSSession -VMName` and `Copy-Item -FromSession` with local admin credentials, but `Copy-Item` is blocked by Constrained Language Mode ([[Microsoft/Windows/WDAC/WDAC\|Windows/WDAC/WDAC]]).
 #TODO can Remote PowerShell work with Entra creds? I think jborean looked at this

I took a brief detour looking at [clixml deserialisation exploits](https://www.truesec.com/hub/blog/attacking-powershell-clixml-deserialization) against the host... But that seemed like overkill.
The solution is simple - stdout is a perfectly good transport layer, right?

```powershell
$s = New-PSSession -VMName msix
Invoke-Command -Session $s -ScriptBlock {
  certutil -encode myfile.csv data.bin
  Get-Content data.bin
} | Out-File data.bin
certutil -decode data.bin myfile.csv
Remove-Item data.bin
```

Just encode the file as a "certificate" (ie base64), write it to the host's stdout, pipe to the host's disk, and decode it.
Sure `certutil` is ugly, but such is life in Constrained Language Mode, without niceties like `[System.Convert]::FromBase64String`.

Let's tie it all together.

```powershell
<#
.SYNOPSIS
Copies a file to or from a virtual machine.
.DESCRIPTION
An improvement of the native Copy-VMFile, with relative filepath support and guest-to-host copying. Folders aren't supported, just zip them instead.
.LINK
https://garden.tplant.com.au/microsoft/hyper-v/
.EXAMPLE
Copy-VMFileEx.ps1 -Name VM01 -SourcePath ./install.exe
.EXAMPLE
Copy-VMFileEx.ps1 -Name VM01 -SourcePath "C:\Users\Public\Downloads\results.zip" -FileSource Guest
#>
[cmdletbinding()]
param(
  # Virtual machine name.
  [parameter(Mandatory)]
  [string]$Name,

  # Source path of the file.
  [parameter(Mandatory)]
  [System.IO.FileInfo]$SourcePath,

  # Destination path of the file.
  [System.IO.FileInfo]$DestinationPath,

  # Source of the file.
  [ValidateSet("Host", "Guest")]
  [string]$FileSource = "Host",

  # Credential to use for the operation.
  [System.Management.Automation.PSCredential]$Credential
)

if ($FileSource -eq "Host") {
  if (-not $DestinationPath) {
    $DestinationPath = "C:\Users\Public\Downloads\$($SourcePath.Name)"
  }

  Copy-VMFile -VMName $Name -SourcePath $SourcePath -DestinationPath $DestinationPath -CreateFullPath -Credential $Credential
}
else {
  if (-not $DestinationPath) {
    $DestinationPath = $SourcePath.Name
  }

  $session = New-PSSession -VMName $Name -Credential $Credential
  Invoke-Command -Session $session -ArgumentList $SourcePath -ScriptBlock {
    param($SourcePath)
    certutil -encode $SourcePath data.bin
    $buffer = Get-Content data.bin
    Remove-Item data.bin
    $buffer
  } | Out-File data.bin
  
  certutil -decode data.bin $DestinationPath
  Remove-Item data.bin
}
```

#TODO provide `SourcePath` completion when source is the guest?
