---
dg-publish: true
---
https://3rdpartysource.microsoft.com/downloads or 3rdpartycode.microsoft.com
Internal https://publish.3rdpartysource.microsoft.com `Third Party Source Code Disclosures - PROD - #2` `f55f60fc-d781-4dd1-9764-e3733137e15a`

this has good stuff too [Accessibility Conformance Reports](https://www.microsoft.com/en-us/accessibility/conformance-reports)
#TODO microsoft electron, edge devtools?

tools/win/msedgede
tools/win/msedgejs windbg extension
EdgeProcessViewer

CERT_SYSTEM_STORE_LOCAL_MACHINE_WCOS
ntdev.microsoft.com

handwriting uses https://github.com/chrislit/abydos

l10n_util.h :(
```cpp
// Get the user-preferred locale, which may differ from the actual process
// locale found with base::i18n::GetConfiguredLocale(). For example, a preferred
// locale of "en-AU" is mapped to a process locale of "en-GB".
COMPONENT_EXPORT(UI_BASE) std::string& GetPreferredLocale();
```


url_constants.h
```
// Edge Specific schemes
inline constexpr char kAppInfoScheme[] = "app-info";
inline constexpr char kEdgeReadScheme[] = "read";
inline constexpr char kEdgeProtocolScheme[] = "microsoft-edge";
inline constexpr char16_t kEdgeProtocolScheme16[] = u"microsoft-edge";
inline constexpr char kEdgeWebCaptureScheme[] = "webcapture";
inline constexpr char kEdgeScheme[] = "edge";
```
## Electron
Uses public sysroots: `https://msftelectronbuild.z5.web.core.windows.net/sysroots/toolchain/<Sha256Sum>/<Tarball>`

MAS is Mac App Store, MtrwDgj is something related to Microsoft Teams Rooms on Windows

![[Pasted image 20240822001128.png|Pasted image 20240822001128.png]]

```json
{
    "bullseye_amd64": {
        "Key": "20230329T085712Z-1",
        "Sha256Sum": "6a468814ee3200152b9ccda8876ac86cd9d28b442fe30a59356a22296277d3a1",
        "SysrootDir": "debian_bullseye_amd64-sysroot",
        "Tarball": "debian_bullseye_amd64_sysroot.tar.xz",
        "URL": "https://msftelectronbuild.z5.web.core.windows.net/sysroots/toolchain"
    },
    "bullseye_arm64": {
        "Key": "20230329T085712Z-1",
        "Sha256Sum": "af4575c58e4d4222a3634db24bc6c1d158dd456f9c0ad551c2e019324e7091ff",
        "SysrootDir": "debian_bullseye_arm64-sysroot",
        "Tarball": "debian_bullseye_arm64_sysroot.tar.xz",
        "URL": "https://msftelectronbuild.z5.web.core.windows.net/sysroots/toolchain"
    },
    "bullseye_armel": {
        "Key": "20230329T085712Z-1",
        "Sha256Sum": "86fd328cf923eeb81bcbdbdb522f73ab3f3750c272201d3f4258bc95a87d2568",
        "SysrootDir": "debian_bullseye_armel-sysroot",
        "Tarball": "debian_bullseye_armel_sysroot.tar.xz",
        "URL": "https://msftelectronbuild.z5.web.core.windows.net/sysroots/toolchain"
    },
    "bullseye_armhf": {
        "Key": "20230329T085712Z-1",
        "Sha256Sum": "f04411e56cc721ac5de94eb2cbc7f3845ff60f286f18b97b30ae03a583465cc3",
        "SysrootDir": "debian_bullseye_armhf-sysroot",
        "Tarball": "debian_bullseye_armhf_sysroot.tar.xz",
        "URL": "https://msftelectronbuild.z5.web.core.windows.net/sysroots/toolchain"
    },
    "bullseye_i386": {
        "Key": "20230329T085712Z-1",
        "Sha256Sum": "6cc59a7b46a08af691cd692bd9fa48ddc0dbee4ec94dea09b0ea043aee024b96",
        "SysrootDir": "debian_bullseye_i386-sysroot",
        "Tarball": "debian_bullseye_i386_sysroot.tar.xz",
        "URL": "https://msftelectronbuild.z5.web.core.windows.net/sysroots/toolchain"
    },
    "bullseye_mips64el": {
        "Key": "20230329T085712Z-1",
        "Sha256Sum": "c4ac483a88e74b8dc58ff39687478502f18fb1b356d6b8fc86d684ec1a82e670",
        "SysrootDir": "debian_bullseye_mips64el-sysroot",
        "Tarball": "debian_bullseye_mips64el_sysroot.tar.xz",
        "URL": "https://msftelectronbuild.z5.web.core.windows.net/sysroots/toolchain"
    },
    "bullseye_mipsel": {
        "Key": "20230329T085712Z-1",
        "Sha256Sum": "561adb4d26d2cca7589fe0ae6fa75ae9b811baf77a8a641b19ae11aa4948ed58",
        "SysrootDir": "debian_bullseye_mipsel-sysroot",
        "Tarball": "debian_bullseye_mipsel_sysroot.tar.xz",
        "URL": "https://msftelectronbuild.z5.web.core.windows.net/sysroots/toolchain"
    }
}
```

## Edge
Interesting to track changes to upstream Chromium...