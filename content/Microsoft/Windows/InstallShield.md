---
dg-publish: true
---
Installing apps on Windows has always been pretty cursed, especially in the early days before Windows Installer (MSI). [InstallShield](https://en.wikipedia.org/wiki/InstallShield) helped back in the 90s by unpacking files, setting regkeys, etc all from a single exe.
Inno, NSIS, and good old MSI are much better nowadays, but a lot of old software still uses one of many InstallShield variants... And since my [work](https://devicie.com) involves silently installing/updating apps on lots of devices, these proprietary old product(s) became my problem.

## Formats
[[Kaitai|Kaitai]] to the rescue! It was pretty easy to find four main formats:
* InstallShield plain
* InstallShield stream

## setup.ini
```ini
 [Info] 
Name=INTL           ;Not used 
Version=1.00.000    ;Not used 
DiskSpace=8000      ;DiskSpace requirement for temporary files in KB 
 
 
[Startup] 
CmdLine=            ;Can be used to pass command line parameters to  
                    ;Setup.exe 
 
SuppressWrongOS=Y   ;Suppresses the display of the warning dialog 
                    ;when trying to install version 1.2 of the  
                    ;Windows Installer engine on Windows 2000.  
                    ;Valid values are Y or N. 
 
ScriptDriven=1      ;Defines whether InstallScript is required 
                    ;to run the installation. The following values 
                    ;for this keyword are valid 
                    ;  0 Basic MSI installation 
                    ;  1 Standard project installation 
                    ;  2 Basic MSI project using InstallScript 
                    ;    custom actions 
 
 
ScriptVer=7.1.0.179 ;Version of the InstallScript engine required  
                    ;for this installation. 
 
 
Product=Developer Art   ;The name of the product being installed  
                        ;for use in the initialization dialog. 
 
PackageName=Developer Art.msi   ;MSI package name for current  
                                ;installation. 
 
MsiVersion=2.0.2600.0   ;Version of the Windows Installer engine 
                        ;required for this installation. 
 
EnableLangDlg=N     ;Indicates whether to display the language  
                    ;selection dialog to the end user so that the  
                    ;language to be used in the user interface can  
                    ;be selected. Values are either Y or N. 
```