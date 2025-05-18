---
dg-publish: true
---
Defender downloads AV signatures from versioned cabinet files hosted on [[Delivery Optimization|Delivery Optimization]]. A lot of bespoke scripts also use this redirection [web service](https://www.microsoft.com/en-us/wdsi/defenderupdates) to download them for offline or unstable clients like VDI, so I thought I'd have a crack at diffing them. Cabinets are available for base+delta versions or just deltas.

| OriginalFilename | FileDescription                                    | ProductVersion |
| ---------------- | -------------------------------------------------- | -------------- |
| mpasbase.vdm     | AntiSpyware Definition Database                    | 1.427.0.0      |
| mpasdlta.vdm     | AntiSpyware Definition Update                      | 1.427.676.0    |
| mpavbase.vdm     | AntiVirus Definition Database                      | 1.427.0.0      |
| mpavdlta.vdm     | AntiVirus Definition Update                        | 1.427.676.0    |
| mpengine.dll     | Microsoft Malware Protection Engine                | 1.1.25030.1    |
| MpSigStub.exe    | Microsoft Malware Protection Signature Update Stub | 1.1.24010.2001 |

base+delta
1. https://go.microsoft.com/fwlink/?LinkID=121721&arch=x64
2. https://definitionupdates.microsoft.com/packages?arch=x64
3. https://definitionupdates.microsoft.com/packages/content/mpam-fe.exe?packageType=Signatures&packageVersion=1.427.676.0&arch=amd64&engineVersion=1.1.25030.1

delta
1. HKLM:\SOFTWARE\Microsoft\Windows Defender\Signature Updates EngineVersion, AVSignatureBaseVersion, ASSignatureBaseVersion
2. http://go.microsoft.com/fwlink/?LinkID=121721&clcid=0x409&arch=x64&eng=1.1.25030.1&avdelta=1.427.0.0&asdelta=1.427.0.0
3. https://definitionupdates.microsoft.com/packages?arch=x64&eng=1.1.25030.1&avdelta=1.427.0.0&asdelta=1.427.0.0
4. https://definitionupdates.microsoft.com/packages/content/mpam-d.exe?packageType=Signatures&packageVersion=1.427.676.0&arch=amd64

`%ProgramData%\Microsoft\Windows Defender\Definition Updates\Backup` also has smaller `.lkg` variants of the VDMs, missing version info but still matching the VDM format.

The VDM file format is proprietary and research is pretty limited
* [4-year-old writeup](https://github.com/commial/experiments/tree/master/windows-defender/VDM) seems to be an early source
* [This one has good diagrams](https://retooling.io/blog/an-unexpected-journey-into-microsoft-defenders-signature-world)
* [Thorough top-down review](https://tttang.com/archive/1798/)

There are some tools though
* [WDExtract](https://github.com/hfiref0x/WDExtract), popular C++ tool for decryption and extracting images
* More recent [defender2yara](https://github.com/t-tani/defender2yara) 
* A few signature extraction tools, [this one](https://github.com/ZPetricusic/defender_signature_parser) is pure python but just dumps signature types from old leaked pdbs
* Or [this one](https://github.com/hongson11698/defender-database-extract), parses decrypted streams to CSV for further analysis in python
This [dive into Defender's Lua VM](https://scrapco.de/blog/fuzzing-windows-defender-with-loadlibrary-in-2025.html) showed up midway through my research too
## Lua decompilation
Some interesting signatures are shipped as compiled Lua scripts, particularly Attack Surface Reduction (ASR) rules. The de facto decomp tool is [viruscamp/luadec](https://github.com/viruscamp/luadec), but it hasn't been touched since 2017 and doesn't provide binary releases. At least someone made a [Docker image](https://gitlab.com/CinCan/tools/-/blob/master/stable/luadec/Dockerfile)... That I can't use on GitHub's Windows runners.

A bit more digging turned up a great web tool https://luadec.metaworm.site/. Shame it's closed source and I need a CLI for automated decomp. I had a quick peek in DevTools just to see if it's easily reversed - glad I did, cause it's a wasm binary.

![[Pasted image 20250509214254.png|Pasted image 20250509214254.png]]

 Packed JavaScript has references to [rustwasm/wasm-bindgen](https://github.com/rustwasm/wasm-bindgen/). Let's see if we can't turn this into a CLI. I tried mocking bindgen JS imports in python at first, but hundreds of type signatures was tricky even with codegen, and decomp might actually need those functions. Maybe we can reuse their JS instead.

Quick recon found a global luadec object that looks promising.

![[Pasted image 20250509214821.png|Pasted image 20250509214821.png]]

`decompile` and `ast_output` look promising. I threw breakpoints on calls to `decompile` then decompiled a file manually to see the args, and wrote this script.
```js
// Uint8Array.fromBase64 isn't supported in Chromium :(
// https://stackoverflow.com/a/21797381
function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

let luac = "mybase64luac"
await luadec.decompile(base64ToArrayBuffer(luac), "0x00001ae4_luac")
console.log(luadec.ast_output())
```

`set_config` looked interesting. It probably matched this UI.

![[Pasted image 20250509215832.png|Pasted image 20250509215832.png]]

The code was easy to find, but I experimented with different values in the UI, and the defaults gave the best results.
```js
luadec.set_config({
    level: "full",
    decompile: true,
    disassemble: false,
    setlist: true,
    eliminate_variable: true,
    second_eliminate: true,
    local_fid: true,
    force_global: false,
    force_settable: true,
    define_function: true,
    encoding: "utf-8",
    filename_encoding: "utf-8",
    string_opt: false
})
```

So far we're just calling from browser console. How can this become a CLI? Well it's set as a global somewhere.
```js
N = new kee.LuaDec(I.decompile),
window.luadec = N,
```

```js
const Pdt = Object.freeze(Object.defineProperty({
    __proto__: null,
    calc_file_id: xdt,
    LuaDec: Adt,
    initSync: kdt,
    default: _$
}, Symbol.toStringTag, {
    value: "Module"
}))
  , kee = Pdt
```

A quick breakpoint shows `I.decompile` is just the config object from earlier, but the class isn't so easy. Can't just copy/paste this one. I really should've expected that with bundled code, ah well.
```js
class Adt {
    constructor(e) {
        const t = pn.luadec_new(e);
        return this.__wbg_ptr = t >>> 0,
        Mee.register(this, this.__wbg_ptr, this),
        this
    }
    ast_output() {
        let e, t;
        try {
            const s = pn.luadec_ast_output(this.__wbg_ptr);
            var n = s[0]
              , r = s[1];
            if (s[3])
                throw n = 0,
                r = 0,
                Wa(s[2]);
            return e = n,
            t = r,
            Ns(n, r)
        } finally {
            pn.__wbindgen_free(e, t, 1)
        }
    }
    decompile(e, t) {
        const n = mW(e, pn.__wbindgen_malloc)
          , r = rl
          , s = oh(t, pn.__wbindgen_malloc, pn.__wbindgen_realloc)
          , o = rl;
        return pn.luadec_decompile(this.__wbg_ptr, n, r, s, o)
    }
    snip(){}
}
```

I ended up compiling luadec and using it with WDExtract and that cpp/python analysis repo, for end-to-end tracking in my [data repo](https://github.com/pl4nty/data).
## Finding a new ASR rule
This whole dive into Defender signatures was kicked off by a [tweet](https://x.com/SecurityAura/status/1919439538579001639) about an unreleased ASR rule `Block execution of files related to Remote Monitoring & Management tools`.
A quick search for `RMM` found the new rule `1081f0b6-3e1e-4f44-acce-816d65112d99` ([source](https://github.com/pl4nty/data/blob/107c924b8e6f0c3d0b5b77f715394cc3dc2837cf/microsoft-defender-signatures/!InfrastructureShared/!%23BLKEXC1081f0b6-3e1e-4f44/0x0000066d_script.lua)), which runs three checks on binary filepaths: `IsRmmToolFilePath`, `IsRmmToolVersionInfo`, and `IsRmmToolOFN`.
These have been used in other rules, and I found the [source](https://github.com/pl4nty/data/blob/107c924b8e6f0c3d0b5b77f715394cc3dc2837cf/microsoft-defender-signatures/!InfrastructureShared/Unknowcategory/0x0000c511_script.lua) in the `!InfrastructureShared` threat. Threats are usually a small group of signatures, but this special infrastructure one has hundreds, so functions like these RMM checks can be reused by a few different signatures.

The luadec decomp for the RMM functions wasn't great, so I threw the binary in https://luadec.metaworm.site/. Looks like a pretty thorough list - with the notable absence of Microsoft's first-party `RemoteHelp.exe`.

```lua
-- filename: 
-- version: lua51
-- line: [0, 0] id: 0
function IsRmmToolFilePath(r0_1)
  -- line: [0, 0] id: 1
  if string.find(r0_1, ":\\windows\\", 1, true) ~= nil then
    for r5_1, r6_1 in ipairs({
      "\\pdq\\pdqdeployrunner\\",
      "\\action1\\",
      "\\laplink everywhere"
    }) do
      if string.find(r0_1, r6_1, 1, true) ~= nil then
        return true
      end
    end
  end
  if string.find(r0_1, ":\\program files", 1, true) ~= nil then
    for r5_1, r6_1 in ipairs({
      "\\anydesk\\",
      "\\atera networks\\ateraagent\\",
      "\\splashtop\\splashtop remote\\",
      "\\teamviewer\\",
      "\\connectwise\\",
      "\\netsupport\\",
      "\\apps\\support\\netsupport\\",
      "\\screenconnect client ",
      "\\ammyy admin\\",
      "\\aweray\\awesun\\",
      "\\centrastage\\",
      "\\solarwinds\\dameware mini remote control x64\\",
      "\\dameware remote everywhere agent\\",
      "\\kaseya\\",
      "\\kaseya\\",
      "\\logmein\\",
      "\\gotoassist remote support",
      "\\mremoteng\\",
      "\\n-able technologies\\",
      "\\solarwinds\\",
      "\\pdq\\pdq remote desktop agent\\",
      "\\pdq\\pdqconnectagent\\",
      "\\pdq\\pdqconnectupdater\\",
      "\\radmin\\",
      "\\realvnc\\",
      "\\remotepc host\\",
      "\\remotepc viewer\\",
      "\\remotepc\\",
      "\\esq sst\\rmm agent\\",
      "\\rustdesk\\",
      "\\rustdesk-fullclient\\",
      "\\supremo\\",
      "\\repairtech\\syncro\\",
      "\\tacticalagent\\",
      "\\tigervnc\\",
      "\\tigervnc server\\",
      "\\tightvnc\\",
      "\\google\\chrome remote desktop\\",
      "\\ultraviewer\\",
      "\\ninjaone\\",
      "\\manageengine\\uems_agent\\",
      "\\site24x7\\winagent\\",
      "\\pulseway\\",
      "\\access remote pc",
      "\\level\\",
      "\\adobe\\connect\\",
      "\\aeroadmin\\",
      "\\aliwangwang\\",
      "\\anyplace control\\",
      "\\anyviewer\\",
      "\\aweray\\awesun\\",
      "\\beanywhere support express\\",
      "\\beyondtrust",
      "\\monitoring client\\plugins\\bomgar\\",
      "\\bomgarjump\\",
      "\\bitvise ssh client\\",
      "\\bitvise ssh server\\",
      "\\crosstec remote control\\",
      "\\nch software\\desktopnow\\",
      "\\domotz\\",
      "\\dwagent\\",
      "\\bravura\\optitune\\",
      "\\ehorus_agent\\",
      "\\emco\\remote agents\\remote installer\\",
      "\\emco\\remote installer\\",
      "\\ericom software\\ericom access server\\",
      "\\ericom software\\ericom connect remote agent",
      "\\ezhelp\\server\\",
      "\\fastviewer remoted service\\",
      "\\simplehelp\\",
      "\\getscreen\\",
      "gotohttpremotecontrolfrombrowser",
      "\\gotomypc\\",
      "\\goverlan inc\\goverlanagent\\",
      "\\helpu\\",
      "\\impero solutions ltd\\impero client\\",
      "\\instant housecall\\",
      "\\itarian\\endpoint manager\\",
      "\\itarian\\remotecontrol\\",
      "\\jumpcloud\\",
      "\\phase five systems\\jump desktop connect\\",
      "\\repairtech\\kabuto\\",
      "\\khelpdesk\\",
      "\\laplink everywhere\\",
      "\\laplink gold\\",
      "meshcentral agent\\mesh agent\\",
      "\\mionet\\",
      "\\mobatek\\mobaxterm\\",
      "\\naverisk\\",
      "\\netop\\netop remote control\\",
      "\\netsupport manager\\",
      "\\kyocera\\netviewer\\",
      "\\panorama9\\",
      "\\parallels\\parallels access\\",
      "\\pcanywhere\\",
      "\\wyse\\pocketcloud\\",
      "\\pulseway remote control\\",
      nil,
      nil,
      nil,
      nil,
      nil,
      nil,
      nil
    }) do
      local r7_1 = string.find(r0_1, r6_1, 1, true)
      if r7_1 ~= nil then
        r7_1 = true
        return r7_1
      end
    end
    for r6_1, r7_1 in ipairs({
      "\\anydesk[^_]+_msi\\",
      "\\intelliadmin%d*\\",
      "\\litemanager%s+pro%s+",
      "\\radmin viewer[%s%d]*\\",
      "\\remote utilities[%s%-]+host\\",
      "\\remote manipulator system[%s%-]+host\\",
      "\\remote manipulator system[%s%-]+viewer\\",
      "\\nomachine[^\\]+\\bin\\nxplayer",
      "\\getscreen%.me\\",
      "\\goverlan reach console %d+\\",
      "\\isl online [^%s\\]*\\isl light\\",
      "\\isl online[^\\]*\\isl alwayson"
    }) do
      local r8_1 = string.find(r0_1, r7_1)
      if r8_1 ~= nil then
        r8_1 = true
        return r8_1
      end
    end
  end
  if string.find(r0_1, ":\\programdata\\", 1, true) ~= nil then
    for r5_1, r6_1 in ipairs({
      "\\centrastage\\",
      "\\kaseya\\",
      "\\ninjarmmagent\\",
      "\\zohoassist\\",
      "\\ctes\\",
      "\\aeroadmin\\",
      "\\bomgar",
      "\\distant desktop\\",
      "\\simplehelp\\elevatesh",
      "\\phase five systems\\jump desktop connect\\",
      "\\khelpdesk\\"
    }) do
      local r7_1 = string.find(r0_1, r6_1, 1, true)
      if r7_1 ~= nil then
        r7_1 = true
        return r7_1
      end
    end
  end
  if string.find(r0_1, "\\appdata\\", 1, true) ~= nil then
    for r5_1, r6_1 in ipairs({
      "\\adobe\\connect\\",
      "\\beyondtrust",
      "\\ezhelp\\server\\",
      "\\jwrapper-simplehelp technician\\",
      "\\gotomypc\\",
      "\\mobaxterm\\",
      "\\pulseway remote control\\"
    }) do
      local r7_1 = string.find(r0_1, r6_1, 1, true)
      if r7_1 ~= nil then
        r7_1 = true
        return r7_1
      end
    end
    for r6_1, r7_1 in ipairs({
      "\\beamyourscreen[%s%d]*\\",
      "\\isl online [^%s\\]*\\isl light\\"
    }) do
      local r8_1 = string.find(r0_1, r7_1)
      if r8_1 ~= nil then
        r8_1 = true
        return r8_1
      end
    end
  end
  for r5_1, r6_1 in ipairs({
    "\\ninjarmm llc qc\\",
    "\\connectwise\\",
    "\\logmein\\",
    "\\gotoassist remote support",
    "\\zoho-assist-desktop\\",
    "\\acronis cyber protect connect",
    "\\remotix\\",
    "\\anysupport\\",
    "\\auvik\\",
    "\\beyondtrust\\",
    "\\desktopcentral_server\\",
    "\\desktopcentral_agent\\",
    "\\pcvisit software ag\\",
    "\\putty\\"
  }) do
    local r7_1 = string.find(r0_1, r6_1, 1, true)
    if r7_1 ~= nil then
      r7_1 = true
      return r7_1
    end
  end
  return false
end
function IsRmmToolVersionInfo(r0_2)
  -- line: [0, 0] id: 2
  local r1_2 = {
    "anydesk",
    "atera",
    "splashtop",
    "teamviewer",
    "connectwise",
    "netsupport",
    "screenconnect",
    "ammyy admin",
    "awesun",
    "rmm agent",
    "rmm webremote agent",
    "n-able take control",
    "dameware",
    "kaseya",
    "romfusclient",
    "romviewer",
    "romserver",
    "lite manager",
    "lmiguardiansvc",
    "logmein",
    "gotoassist",
    "mremoteng",
    "nable",
    "solarwinds",
    "ninjaremote",
    "pdq deploy",
    "pdq.com",
    "pdq inventory",
    "radmin viewer",
    "realvnc",
    "vncagent",
    "remotepc",
    "remote utilities",
    "remote manipulator system",
    "rustdesk",
    "supremo",
    "syncro",
    "tactical rmm",
    "tigervnc",
    "tightvnc",
    "zoho assist",
    "chrome remote desktop",
    "ultraviewer",
    "ninjarmm",
    "ninjawpm",
    "manageengine",
    "site24x7",
    "247ithelp",
    "remote workforce client",
    "absolute ",
    "ctesdetect",
    "access remote pc",
    "acronis",
    "level remote control",
    "action1",
    "adobe connect",
    "aeroadmin",
    "alpemix",
    "anysupport",
    "anyplace",
    "anyviewer",
    "auvik",
    "awesun",
    "bitvise",
    "crosstec remote control",
    "crosstec client application",
    "desktopnow",
    "distant desktop",
    "optitune",
    "ehorus",
    "emco remote installer",
    "emco remote service",
    "ericom blaze",
    "ericomrdp",
    "ericom access server",
    "ericom access accessnow",
    "ericom blaze",
    "fastviewer",
    "nomachine player",
    "freerdp",
    "simplehelp",
    "getscreen.me",
    "gotohttp",
    "gotomypc",
    "goverlan",
    "helpu viewer",
    "helpu auto updater",
    "helpu manager",
    "helpu host",
    "impero connect",
    "impero remote manager",
    "imperoclient",
    "imperoutilities",
    "imperoclientsvc",
    "instant housecall",
    "isl light",
    "isl alwayson",
    "endpoint manager rmm service",
    "remote control by itarian",
    "ivanti agentless rc",
    "windows agentless remote control",
    "jumpcloud remote assist",
    "jumpcloud agent",
    "jump desktop",
    "kabuto",
    "khelpdesk",
    "kickidler",
    "laplink everywhere",
    "laplink gold",
    "manageengine",
    "manage engine",
    "endpointcentral",
    "endpoint central",
    "desktopcentral",
    "desktop central",
    "meshcentral",
    "mesh central",
    "mesh agent service",
    "mionet",
    "mobaxterm",
    "naverisk",
    "netop remote control",
    "netop helper service",
    "netsupport remote control",
    "netsupport manager",
    "cpr viewer",
    "algorius net viewer",
    "kyocera net viewer",
    "panorama9",
    "parallels access",
    "pcanywhere",
    "pcvisit",
    "wyseremoteaccess",
    "wyse remote access",
    "pocketcloud",
    "putty",
    "pulseway"
  }
  local r2_2 = {
    "tv_w32.exe",
    "tv_x64.exe",
    "cagservice.exe",
    "aemagent.exe",
    "intelliadmin.exe",
    "kausrtsk.exe",
    "litemanager.exe",
    "lmiguardiansvc",
    "ncstreamer.exe",
    "pdqdeployconsole.exe",
    "pdqrunner.exe",
    "pdqinventoryconsole.exe",
    "pdqinventoryscanner.exe",
    "radmin.exe",
    "vncserverui.exe",
    "vncviewer.exe",
    "winvnc4.exe",
    "vncserver.exe",
    "vncconfig.exe",
    "vncaddrbook.exe",
    "rpcvieweruiu.exe",
    "tacticalrmm.exe",
    "winvnc4.exe",
    "vncviewer.exe",
    "tvnserver.exe",
    "hookldr.exe",
    "remoting_native_messaging_host.exe",
    "remoting_desktop.exe",
    "remoting_host.exe",
    "remoting_assistance_host.exe",
    "ctes.exe",
    "ctespersitence.exe",
    "cteshostsvc.exe",
    "level-remote-control-ffmpeg.exe",
    "action1_agent.exe",
    "adobeconnectaddin.exe",
    "aeroadmin.exe",
    "alitask.exe",
    "alpemix.exe",
    "apc_host.exe",
    "rcclinet.exe",
    "screancap.exe",
    "auvikservice.exe",
    "auvikagent.exe",
    "awesun.exe",
    "beamyourscreen.exe",
    "beamyourscreen-host.exe",
    "basupclphlp.exe",
    "basupsrvc.exe",
    "basupsrvccnfg.exe",
    "basupsrvcupdater.exe",
    "basupsysinf.exe",
    "basuptshelper.exe",
    "tcintegratorcommhelper.exe",
    "tclauncherhelper.exe",
    "totermw.exe",
    "sfsserver.exe",
    "sfsserver64.exe",
    "pcictlui.exe",
    "ehorus_agent.exe",
    "ehorus_kill.exe",
    "ehorus_tray.exe",
    "ehorus_cmd.exe",
    "ehorus_uit.exe",
    "ericomrdp.exe",
    "systemmonitor.exe",
    "fastviewer.exe",
    "nxplayer.exe",
    "wfreerdp.exe",
    "getscreen.exe",
    "gotohttp.exe",
    "g2host.exe",
    "gotomypc.exe",
    "goverlan.exe",
    "helpuviewer.exe",
    "helpuserver.exe",
    "helpuupdater.exe",
    "imperoclientsvc.exe",
    "instanthousecall.exe",
    "rmmservice.exe",
    "agentlessrc.exe",
    "jumpcloud-agent.exe",
    "jumpconnect.exe",
    "jumpdesktopconnect.exe",
    "jumpupdater.exe",
    "jumpdesktopupdater.exe",
    "jumpclient.exe",
    "kabuto.app.runner.exe",
    "kabuto.service.runner.exe",
    "khelpdesk.exe",
    "oosysremotedesktopui.exe",
    "oosysagent.exe",
    "laplink.exe",
    "netviewer.exe",
    "netviewerserver.exe",
    "prlsvcctl.exe",
    "prl_deskctl_agent.exe",
    "prl_deskctl_wizard.exe",
    "pcvisit_service_client.exe",
    "pcvisit_client.exe",
    "wyseremoteaccess.exe",
    "pocketcloudservice.exe",
    "remotedesktop.exe"
  }
  local r3_2 = sysio.GetPEVersionInfo(r0_2)
  if r3_2 == nil then
    return false
  end
  if r3_2.OriginalFilename ~= nil and r3_2.OriginalFilename ~= "" then
    local r4_2 = string.lower(r3_2.OriginalFilename)
    for r8_2, r9_2 in ipairs(r1_2) do
      local r10_2 = string.find(r4_2, r9_2, 1, true)
      if r10_2 ~= nil then
        r10_2 = true
        return r10_2
      end
    end
    for r8_2, r9_2 in ipairs(r2_2) do
      if r4_2 == r9_2 then
        local r10_2 = true
        return r10_2
      end
    end
  elseif r3_2.ProductName ~= nil and r3_2.ProductName ~= "" then
    local r4_2 = string.lower(r3_2.ProductName)
    for r8_2, r9_2 in ipairs(r1_2) do
      local r10_2 = string.find(r4_2, r9_2, 1, true)
      if r10_2 ~= nil then
        r10_2 = true
        return r10_2
      end
    end
  elseif r3_2.FileDescription ~= nil and r3_2.FileDescription ~= "" then
    local r4_2 = string.lower(r3_2.FileDescription)
    for r8_2, r9_2 in ipairs(r1_2) do
      local r10_2 = string.find(r4_2, r9_2, 1, true)
      if r10_2 ~= nil then
        r10_2 = true
        return r10_2
      end
    end
    for r8_2, r9_2 in ipairs(r2_2) do
      local r10_2 = string.find(r4_2, r9_2, 1, true)
      if r10_2 ~= nil then
        r10_2 = true
        return r10_2
      end
    end
  end
  return false
end
function IsRmmToolOFN(r0_3)
  -- line: [0, 0] id: 3
  local r1_3 = MpCommon.GetOriginalFileName(r0_3)
  if r1_3 ~= nil and r1_3 ~= "" then
    r1_3 = string.lower(r1_3)
    local r2_3 = nil
    r2_3 = string.match(r1_3, "%.([^%.]+)$")
    if r2_3 == nil then
      r1_3 = r1_3 .. ".exe"
      r2_3 = "exe"
    end
    if r2_3 == "exe" then
      for r7_3, r8_3 in ipairs({
        "tv_w32.exe",
        "tv_x64.exe",
        "cagservice.exe",
        "aemagent.exe",
        "intelliadmin.exe",
        "kausrtsk.exe",
        "litemanager.exe",
        "lmiguardiansvc",
        "ncstreamer.exe",
        "pdqdeployconsole.exe",
        "pdqrunner.exe",
        "pdqinventoryconsole.exe",
        "pdqinventoryscanner.exe",
        "radmin.exe",
        "vncserverui.exe",
        "vncviewer.exe",
        "winvnc4.exe",
        "vncserver.exe",
        "vncconfig.exe",
        "vncaddrbook.exe",
        "rpcvieweruiu.exe",
        "tacticalrmm.exe",
        "winvnc4.exe",
        "vncviewer.exe",
        "tvnserver.exe",
        "hookldr.exe",
        "remoting_native_messaging_host.exe",
        "remoting_desktop.exe",
        "remoting_host.exe",
        "remoting_assistance_host.exe",
        "ctes.exe",
        "ctespersitence.exe",
        "cteshostsvc.exe",
        "level-remote-control-ffmpeg.exe",
        "action1_agent.exe",
        "adobeconnectaddin.exe",
        "aeroadmin.exe",
        "alitask.exe",
        "alpemix.exe",
        "apc_host.exe",
        "rcclinet.exe",
        "screancap.exe",
        "auvikservice.exe",
        "auvikagent.exe",
        "awesun.exe",
        "beamyourscreen.exe",
        "beamyourscreen-host.exe",
        "basupclphlp.exe",
        "basupsrvc.exe",
        "basupsrvccnfg.exe",
        "basupsrvcupdater.exe",
        "basupsysinf.exe",
        "basuptshelper.exe",
        "tcintegratorcommhelper.exe",
        "tclauncherhelper.exe",
        "totermw.exe",
        "sfsserver.exe",
        "sfsserver64.exe",
        "pcictlui.exe",
        "ehorus_agent.exe",
        "ehorus_kill.exe",
        "ehorus_tray.exe",
        "ehorus_cmd.exe",
        "ehorus_uit.exe",
        "ericomrdp.exe",
        "systemmonitor.exe",
        "fastviewer.exe",
        "nxplayer.exe",
        "wfreerdp.exe",
        "getscreen.exe",
        "gotohttp.exe",
        "g2host.exe",
        "gotomypc.exe",
        "goverlan.exe",
        "helpuviewer.exe",
        "helpuserver.exe",
        "helpuupdater.exe",
        "imperoclientsvc.exe",
        "instanthousecall.exe",
        "rmmservice.exe",
        "agentlessrc.exe",
        "jumpcloud-agent.exe",
        "jumpconnect.exe",
        "jumpdesktopconnect.exe",
        "jumpupdater.exe",
        "jumpdesktopupdater.exe",
        "jumpclient.exe",
        "kabuto.app.runner.exe",
        "kabuto.service.runner.exe",
        "khelpdesk.exe",
        "oosysremotedesktopui.exe",
        "oosysagent.exe",
        "laplink.exe",
        "netviewer.exe",
        "netviewerserver.exe",
        "prlsvcctl.exe",
        "prl_deskctl_agent.exe",
        "prl_deskctl_wizard.exe",
        "pcvisit_service_client.exe",
        "pcvisit_client.exe",
        "wyseremoteaccess.exe",
        "pocketcloudservice.exe",
        "remotedesktop.exe",
        nil
      }) do
        if r1_3 == r8_3 then
          local r9_3 = true
          return r9_3
        end
      end
    end
  end
  return false
end

```