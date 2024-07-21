---
{"dg-publish":true,"permalink":"/microsoft/one-drive/","updated":"2024-07-21T14:26:08.124+10:00"}
---

A file sync solution for consumers and commercial, latter is backed by SharePoint.

```
00007ff6`b7e50000 00007ff6`b817d000   OneDrive   (no symbols)           
    Loaded symbol image file: C:\Users\tom\AppData\Local\Microsoft\OneDrive\OneDrive.exe
    Image path: OneDrive.exe
    Image name: OneDrive.exe
    Browse all global symbols  functions  data
    Image was built with /Brepro flag.
    Timestamp:        42FBF1C1 (This is a reproducible build file hash, not a timestamp)
    CheckSum:         003300A7
    ImageSize:        0032D000
    File version:     24.70.407.1
    Product version:  24.70.407.1
    File flags:       20 (Mask 3F) Special
    File OS:          4 Unknown Win32
    File type:        1.0 App
    File date:        00000000.00000000
    Translations:     0409.04b0
    Information from resource tables:
        CompanyName:      Microsoft Corporation
        ProductName:      Microsoft OneDrive
        InternalName:     Client Application
        OriginalFilename: OneDrive.exe
        ProductVersion:   24.070.0407.0001
        FileVersion:      24.070.0407.0001
        SpecialBuild:     b/build/f6c2e066-7e5f-236c-063e-183774618411
        FileDescription:  Microsoft OneDrive
        LegalCopyright:   © Microsoft Corporation. All rights reserved.
```

Quite a few regkeys at `HKLM:\SOFTWARE\Policies\Microsoft\OneDrive`. ADMX/ADMLs shipped in `%localappdata%\Microsoft\OneDrive\$version\adm`.

```
SharePointOnPremOIDC
SOFTWARE\Microsoft\OneDrive\Tenants\
DisablePersonalSync
GPOSetUpdateRing
EnableEnterpriseUpdate
DefaultRootDir
DisableCustomRoot
GPOEnabled
Remote Access
PreventNetworkTrafficPreUserSignIn
SilentAccountConfig
DisableAutoConfig
DisableNewAccountDetection
DiskSpaceCheckThresholdMB
FilesOnDemandEnabled
DehydrateSyncedTeamSites
AllowTenantList
BlockTenantList
UploadBandwidthLimit
DownloadBandwidthLimit
SharePointOnPremPrioritization
SharePointOnPremFrontDoorUrl
SharePointOnPremTenantName
DisableTutorial
TenantAutoMount
LocalMassDeleteFileDeleteThreshold
MinDiskSpaceLimitInMB
WarningMinDiskSpaceLimitInMB
ForcedLocalMassDeleteDetection
PermitDisablePermissionInheritance
EnableAutomaticUploadBandwidthManagement
AADJMachineDomainGuid
EnableOneNoteSupportPreview
EnableODIgnoreListFromGPO
> EnableODIgnoreFolderListFromGPO
SyncAdminReportsPreview
SyncAdminReports
EnableSyncAdminReports
DisableFirstDeleteDialog
TelemetryUploadUri
DisableFREAnimation
AddedFolderHardDeleteOnUnmount
AddedFolderUnmountOnPermissionsLoss
EnableAutoStart
EnableAllOcsiClients
EnableHoldTheFile
KFMOptInWithWizard
KFMSilentOptIn
KFMSilentOptInDocuments
KFMSilentOptInPictures
KFMSilentOptInDesktop
KFMSilentOptInWithNotification
KFMBlockOptIn
KFMBlockOptOut
KfmForceWindowsDisplayLanguage
DisablePauseOnBatterySaver
DisablePauseOnMeteredNetwork
DisableGranularFeedbackSendFeedback
DisableGranularFeedbackRespondToSurveys
DisableGranularFeedbackContactSupport
EnableContactSupport
EnableSendFeedback
EnableSurveyCampaigns
MachineId
D:(A;OICI;GA;;;SY)(A;OICI;GA;;;BA)(A;OICI;GR;;;WD)
```

Version API available via Evergreen, but MSIT Slow was newer than Fast: https://g.live.com/1rewlive5skydrive/MsitSlowV2

https://www.sharepoint-rhein-ruhr.de/wp-content/uploads/2018/11/OneDriveDeepDive.pdf

No symbols on MS Symbol Server, despite Office symbols being available. Code references `D:\dbs\sh\odct\0407_230744\client\onedrive\Product\UX\Exe\obj\amd64\OneDrive.pdb`

`.sympath cache*;srv*<server>;srv*<server>

```
https://msdl.microsoft.com/download/symbols
https://chromium-browser-symsrv.commondatastorage.googleapis.com
https://randomascii-symbols.commondatastorage.googleapis.com
https://symbols.mozilla.org/
https://symbolserver.unity3d.com/
https://ctxsym.citrix.com/symbols
https://software.intel.com/sites/downloads/symbols/
https://driver-symbols.nvidia.com/
https://download.amd.com/dir/bin
https://download.amd.com/dir/bin_2018
https://symbols.nuget.org/download/symbols
```


# PowerShell modules
`EnableODIgnoreFolderListFromGPO` was looking like a great solution to avoid syncing PowerShell modules in Documents (https://github.com/PowerShell/PowerShell/issues/15552). But it [didn't actually apply](https://github.com/PowerShell/PowerShell/issues/15552#issuecomment-2067938455), and was [nuked from the docs](https://github.com/MicrosoftDocs/OfficeDocs-SharePoint/commit/e1cb55bd26176f9ce077eaaffc5369352b1fc9ee) in June... As of July, it's still part of `OneDrive.exe`.