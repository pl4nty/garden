---
dg-publish: true
---
## RISC-V International Membership
The [individual membership form](https://enrollment.lfx.linuxfoundation.org/?individual=&project=risc-v-international) attempts to block business and educational email addresses using form validation. It mistakenly blocks my email too.
We can bypass it using [Chrome body overrides](https://developer.chrome.com/docs/devtools/overrides#make-changes), by overriding `GET https://oorh4r4cc0.execute-api.us-east-2.amazonaws.com/prod/public-domain?domain=tplant.com.au` with the following body.
```json
{
    "domains": [
        "tplant.com.au"
    ],
    "emails": [
        "tplant.com.au"
    ],
    "meta": {
        "offset": 0,
        "page_size": 1,
        "total_size": 1
    }
}
```
## Talos Bringup
RISC-V SBCs like the Lichee Pi 4 and [Sipeed LM3A/5A](https://twitter.com/sipeedio/status/1778612306613829871) are starting to hit the market, so I thought I'd start on Talos support early. I worked in this order:

* bldr
* pkgs ca-certs and fhs
* bldr with pkgs
* stagex (new in v1.10)
* toolchain
* tools
* pkgs
* talos

Images can be downloaded or built from my [GitHub fork](https://github.com/pl4nty/talos). I used [namespace](http://namespace.so/) in a few repos where cross-compilation was supported, but the remainder needed native builds. At first I tried a [Scaleway RISC-V server](https://labs.scaleway.com/en/em-rv1/) to learn more about [[BuildKit|BuildKit]], but `pkgs` exceeded the 6-hour GitHub timeout repeatedly and was only able to complete by partial caching between runs. #TODO would these [publicly-available runners](https://github.com/riscv-builders/riscv-builders.github.io/) be faster? maintainer says I can try it

These dependencies are also missing RISC-V support:
- [x] [Stable Alpine release](https://gitlab.alpinelinux.org/alpine/aports/-/issues/13269), currently using `edge` in bldr. now stable, and talos swapped to [StageX](https://stagex.tools/) anyway
- [ ] [Free NVIDIA kernel modules](https://github.com/NVIDIA/open-gpu-kernel-modules/pull/152)
- [ ] [Non-free NVIDIA kernel modules](https://download.nvidia.com/XFree86/)
- [x] [iPXE](https://github.com/ipxe/ipxe/pull/970). done in [#1307](https://github.com/ipxe/ipxe/pull/1307)
- [ ] [kernel-hardening-checker](https://github.com/a13xp0p0v/kernel-hardening-checker/issues/56) coming in [#172](https://github.com/a13xp0p0v/kernel-hardening-checker/pull/172)

The Lichee Pi 4 has confirmed Turing Pi 2 support with networking, but no PCIe/SATA. Might be a good option if I can't get an LM3A/5A to test.

I hit an unrecognised opcode error when assembling gcc, on a [header file related to vector extensions](https://github.com/gcc-mirror/gcc/commit/89367e794613bdeb21df3e6fc0215f0acd553ef8). Turned out to be an old gas version. The latest binutils should fix it.
## Boards
### Milk-V
Milk-V just announced their Jupiter/Megrez NX equivalents with the same K1/EIC7700 chips. No forum discussion let alone ETA, but they have a better track record of [mainline support](https://patchwork.kernel.org/project/linux-riscv/list/?series=&submitter=&state=*&q=milk-v&archive=&delegate=).
### Sipeed LicheePi 3A/5A
3A only ships with a carrier board but the 8GB variant is [out of stock](https://www.aliexpress.com/item/1005007656383220.html) anyway. Based on the Spacemit K1, [mainline is in progress](https://patchwork.kernel.org/project/linux-riscv/list/?series=&submitter=&state=*&q=SpaceMIT&archive=both&delegate=). Possibly better multicore performance than the unreleased 5A.
### Sipeed Lichee Pi 4A
Popular but slow [T-Head](https://www.t-head.cn/) RISC-V [TH1520](https://www.t-head.cn/product/yeying) SOC with a known silicon vulnerability. Scaleway [added serial support](https://x.com/seblu84/status/1795739245211951201) to their bare metal service, so I tried booting mainline U-Boot and Linux. The boot process is:
* Vendor U-Boot
* Chainload [mainline U-Boot at 0xc0100000](https://wiki.sipeed.com/hardware/en/lichee/th1520/lpi4a/7_develop.html#Mainline:~:text=Mainline%20U%2Dboot%20is%20expected%20to%20be%20loaded%20at%200x1c00000)

Resources:
* https://github.com/dlan17/u-boot/tree/th1520/net
* https://github.com/chainsx/thead-u-boot
* https://wiki.sipeed.com/hardware/en/lichee/th1520/lpi4a/7_develop.html
* https://github.com/u-boot/u-boot/blob/master/doc/board/thead/lpi4a.rst
* https://wiki.sipeed.com/hardware/en/lichee/th1520/lpi4a/4_burn_image.html
* https://github.com/chainsx/armbian-riscv-build/
* https://console.scaleway.com/elastic-metal/servers

#TODO rebase when ready to test, add kernel configs for Lichee Pi serial, build ISO for UEFI

``` fold title:"Boot logs without overlay"
brom_ver 8
[APP][E] protocol_connect failed, exit.
-----------------------------------------
               .=@@@@@@@@-.
             .@@@@@@@@@@@@@@@@.
          :@@@@@%      .@@@@@@.
         @@@@@.            .@@@@@
        @@@@.                :@@@@
       %@@@.                  .@@@*
      .@@@-    @@@@@@@@@       *@@@.
      -@@@     @@@@@@@@+        @@@:
      =@@@     @@@-             @@@-
      =@@@     @@@-    :@@@     @@@-
      =@@@     @@@-    @@@@     @@@-
      =@@@     @@@:    @@@@     @@@-
      =@@@             @@@@     @@@-
      =@@@        =@@@@@@@@     @@@-
      =@@@        @@@@@@@@@     @@@-
      =@@@                      @@@-
       %@:                      -@#        -- Presented by SCALEWAY LABS
      :@@@@@@@@@@@@@@@@@@@@@@@@@@@@.
      .@@@@@@@@@@@@@@@@@@@@@@@@@@@@.

U-Boot SPL 2020.01 (Feb 16 2024 - 17:06:02 +0000)
FM[1] lpddr4x dualrank freq=3733 64bit dbi_off=n sdram init
Wipe SDRAM from 0x0000000000000000 to 0x0000000400000000
flush CPU dcache
ddr initialized, jump to uboot
image has no header


U-Boot 2020.01 (Feb 16 2024 - 17:06:02 +0000)

CPU:   rv64imafdcvsu
Model: T-HEAD c910 light
DRAM:  16 GiB
C910 CPU FREQ: 750MHz
AHB2_CPUSYS_HCLK FREQ: 250MHz
AHB3_CPUSYS_PCLK FREQ: 125MHz
PERISYS_AHB_HCLK FREQ: 250MHz
PERISYS_APB_PCLK FREQ: 62MHz
GMAC PLL POSTDIV FREQ: 1000MHZ
DPU0 PLL POSTDIV FREQ: 1188MHZ
DPU1 PLL POSTDIV FREQ: 1188MHZ
MMC:   sdhci@ffe7080000: 0, sd@ffe7090000: 1
Error reading output register
Warning: cannot get lcd-en GPIO
LCD panel cannot be found : -121
splash screen startup cost 16 ms
In:    serial
Out:   serial
Err:   serial
Net:
Warning: ethernet@ffe7070000 using MAC address from ROM
eth0: ethernet@ffe7070000ethernet@ffe7070000:0 is connected to ethernet@ffe7070000.  Reconnecting to ethernet@ffe7060000

Warning: ethernet@ffe7060000 (eth1) using random MAC address - 8a:3b:c5:52:eb:1f
, eth1: ethernet@ffe7060000
Booting in 0s
ethernet@ffe7060000 Waiting for PHY auto negotiation to complete..... done
Speed: 100, full duplex
BOOTP broadcast 1
DHCP client bound to address 62.210.163.44 (13 ms)
Speed: 100, full duplex
Using ethernet@ffe7070000 device
TFTP from server 51.159.47.198; our IP address is 62.210.163.44; sending through gateway 62.210.163.33
Filename 'saturnv/boot.itb'.
Load address: 0xc0100000
Loading: #################################################################
         #################################################################
         #################################################################
         #################################################################
         #################################################################
         #################################################################
         ############################
         3.4 MiB/s
done
Bytes transferred = 6133167 (5d95af hex)
## Executing script at c0100000
sha256+ ethaddr_slug=a20103aa7703
Speed: 100, full duplex
BOOTP broadcast 1
DHCP client bound to address 62.210.163.44 (13 ms)
>>> Loading dynamic environment.
Speed: 100, full duplex
Using ethernet@ffe7070000 device
TFTP from server 51.159.47.198; our IP address is 62.210.163.44; sending through gateway 62.210.163.33
Filename 'saturnv/env.txt'.
Load address: 0xc5000000
Loading: #
         18.6 KiB/s
done
Bytes transferred = 96 (60 hex)
Speed: 100, full duplex
Using ethernet@ffe7070000 device
TFTP from server 51.159.47.198; our IP address is 62.210.163.44; sending through gateway 62.210.163.33
Filename 'saturnv/env-a20103aa7703.txt'.
Load address: 0xc5000000
Loading: *
TFTP error: 'File not found' (1)
Not retrying...
>>> Enabling MMC write protection for boot partitions.
boot areas protected
>>> Loading firmwares.
## Copying 'aon' subimage from FIT image at c0100000 ...
sha256+    Loading part 10 ... OK
## Copying 'audio' subimage from FIT image at c0100000 ...
sha256+    Loading part 10 ... OK
>>> Loading secondary u-boot firmware.
## Copying 'u-boot' subimage from FIT image at c0100000 ...
sha256+    Loading part 0 ... OK
>>> Chainloading U-Boot.
## Starting application at 0xC1000000 ...


U-Boot 2020.01 (May 24 2024 - 08:41:05 +0000)

CPU:   rv64imafdcvsu
Model: T-HEAD c910 light
DRAM:  16 GiB
C910 CPU FREQ: 750MHz
AHB2_CPUSYS_HCLK FREQ: 250MHz
AHB3_CPUSYS_PCLK FREQ: 125MHz
PERISYS_AHB_HCLK FREQ: 250MHz
PERISYS_APB_PCLK FREQ: 62MHz
GMAC PLL POSTDIV FREQ: 1000MHZ
DPU0 PLL POSTDIV FREQ: 1188MHZ
DPU1 PLL POSTDIV FREQ: 1188MHZ
MMC:   sdhci@ffe7080000: 0, sd@ffe7090000: 1
Error reading output register
Warning: cannot get lcd-en GPIO
LCD panel cannot be found : -121
splash screen startup cost 15 ms
In:    serial
Out:   serial
Err:   serial
Net:
Warning: ethernet@ffe7070000 using MAC address from ROM
eth0: ethernet@ffe7070000ethernet@ffe7070000:0 is connected to ethernet@ffe7070000.  Reconnecting to ethernet@ffe7060000

Warning: ethernet@ffe7060000 (eth1) using random MAC address - f6:31:61:9c:26:c9
, eth1: ethernet@ffe7060000
Hit any key to stop autoboot:  0
ethernet@ffe7060000 Waiting for PHY auto negotiation to complete. done
Speed: 100, full duplex
BOOTP broadcast 1
DHCP client bound to address 62.210.163.44 (13 ms)
Speed: 100, full duplex
Using ethernet@ffe7070000 device
TFTP from server 51.159.47.198; our IP address is 62.210.163.44; sending through gateway 62.210.163.33
Filename 'saturnv/boot.itb'.
Load address: 0xc1100000
Loading: #################################################################
         #################################################################
         #################################################################
         #################################################################
         #################################################################
         #################################################################
         ############################
         3.5 MiB/s
done
Bytes transferred = 6133167 (5d95af hex)
## Executing script at c1100000
sha256+ ethaddr_slug=a20103aa7703
Speed: 100, full duplex
BOOTP broadcast 1
DHCP client bound to address 62.210.163.44 (13 ms)
>>> Loading dynamic environment.
Speed: 100, full duplex
Using ethernet@ffe7070000 device
TFTP from server 51.159.47.198; our IP address is 62.210.163.44; sending through gateway 62.210.163.33
Filename 'saturnv/env.txt'.
Load address: 0xc5000000
Loading: #
         18.6 KiB/s
done
Bytes transferred = 96 (60 hex)
Speed: 100, full duplex
Using ethernet@ffe7070000 device
TFTP from server 51.159.47.198; our IP address is 62.210.163.44; sending through gateway 62.210.163.33
Filename 'saturnv/env-a20103aa7703.txt'.
Load address: 0xc5000000
Loading: *
TFTP error: 'File not found' (1)
Not retrying...
>>> Waiting 10 seconds. Stand by.
>>> Downloading iPXE bootscript.
Speed: 100, full duplex
WGET <NULL>
HTTP/1.1 200 OK
Packets received 4, Transfer Successful
Bytes transferred = 232 (e8 hex)
>>> Starting iPXE sequence.
Boot local UEFI, ipxe will exit with error 0x000001, don't panic !
It will boot on the next boot order item
sanboot: --no-describe --drive 0 --filename \EFI\BOOT\BOOTX64.EFI
** Unrecognized filesystem type **
## Executing script at c1100000
sha256+ >>> Loading environment.
Invalid image type for imxtract
>>> Loading OpenSBI.
Invalid image type for imxtract
resetting ...
```

so I installed Debian then SSHed to install Talos.
```sh
sudo apt install wget unzip xz-utils
wget <actions artefact URL> -O image.zip
unzip image.zip
xz -d metal-riscv64.raw.xz
sudo dd if=metal-arm64.raw of=/dev/mmcblk0 conv=fsync bs=4M
```