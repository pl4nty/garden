---
dg-publish: true
---
## RISC-V International
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

I'm mostly a member for toolchain and bringup rather than specs, but the broad spec categories are
* ISA
* Non-ISA
* Profiles: feature discoverability and stability, especially with such a large embedded presence in the community
* Platforms: hardware requirements, like OS-A Platform for Embedded and Server [riscv-platform-specs/riscv-platform-spec.adoc at main · riscvarchive/riscv-platform-specs](https://github.com/riscvarchive/riscv-platform-specs/blob/main/riscv-platform-spec.adoc)
* Software
Some of these are finalised on [RISC-V Technical Specifications - Home - RISC-V Tech Hub](https://lf-riscv.atlassian.net/wiki/spaces/HOME/pages/16154769/RISC-V+Technical+Specifications#Non-ISA-Specifications)
## Talos Bringup
RISC-V SBCs like the Lichee Pi 4 and [Sipeed LM3A/5A](https://twitter.com/sipeedio/status/1778612306613829871) are starting to hit the market, so I thought I'd start on Talos support early. I worked in this order:

* [bldr](https://github.com/pl4nty/talos-bldr)
* [pkgs](https://github.com/pl4nty/talos-pkgs) ca-certs and fhs
* bldr with ca-certs and fhs
* [stagex](https://github.com/pl4nty/talos-stagex) (new in v1.10)
* bldr with stagex busybox
* [toolchain](https://github.com/pl4nty/talos-toolchain)
* tools
* pkgs, with kconfig from `make kernel-menuconfig USERNAME=pl4nty PLATFORM=linux/riscv64` on a copied `config-arm64`
* talos

Images can be downloaded or built from my [GitHub fork](https://github.com/pl4nty/talos). I used [namespace](http://namespace.so/) in a few repos where cross-compilation was supported, but the remainder needed native builds. At first I tried a [Scaleway RISC-V server](https://labs.scaleway.com/en/em-rv1/) to learn more about [[BuildKit|BuildKit]], but `pkgs` exceeded the 6-hour GitHub timeout repeatedly and was only able to complete by partial caching between runs. Unfortunately these [publicly-available runners](https://github.com/riscv-builders/riscv-builders.github.io/) can't run BuildKit.

These dependencies are also missing RISC-V support:
- [x] [Stable Alpine release](https://gitlab.alpinelinux.org/alpine/aports/-/issues/13269), currently using `edge` in bldr. now stable, and talos swapped to [StageX](https://stagex.tools/) anyway
- [ ] [Free NVIDIA kernel modules](https://github.com/NVIDIA/open-gpu-kernel-modules/pull/152)
- [ ] [Non-free NVIDIA kernel modules](https://download.nvidia.com/XFree86/)
- [x] [iPXE](https://github.com/ipxe/ipxe/pull/970). done in [#1307](https://github.com/ipxe/ipxe/pull/1307)
- [x] [kernel-hardening-checker](https://github.com/a13xp0p0v/kernel-hardening-checker/issues/56) coming in [#172](https://github.com/a13xp0p0v/kernel-hardening-checker/pull/172)

The Lichee Pi 4 has confirmed Turing Pi 2 support with networking, but no PCIe/SATA. Might be a good option if I can't get an LM3A/5A to test.

I hit an unrecognised opcode error when assembling gcc, on a [header file related to vector extensions](https://github.com/gcc-mirror/gcc/commit/89367e794613bdeb21df3e6fc0215f0acd553ef8). Turned out to be an old gas version. The latest binutils should fix it.
## Boards
### Milk-V
Milk-V just announced their Jupiter/Megrez NX equivalents with the same K1/EIC7700 chips. No forum discussion let alone ETA, but they have a better track record of [mainline support](https://patchwork.kernel.org/project/linux-riscv/list/?series=&submitter=&state=*&q=milk-v&archive=&delegate=).
### Sipeed LicheePi 3A/5A
3A only ships with a carrier board but the 8GB variant is [out of stock](https://www.aliexpress.com/item/1005007656383220.html) anyway. Based on the Spacemit K1, [mainline is in progress](https://github.com/spacemit-com/linux/wiki) ([Patchwork](https://patchwork.kernel.org/project/linux-riscv/list/?series=&submitter=&state=*&q=SpaceMIT&archive=both&delegate=)). Likely better multicore performance than the unreleased 5A, which uses an EIC7700 or EIC7700X. Mainline progress is [tracked here](https://github.com/spacemit-com/linux/wiki), support isn't great and the version with a motherboard for flashing [isn't available anyway](https://item.taobao.com/item.htm?id=825146039008&skuId=5546630573923&spm=tbpc.tborder.item.d_title825146039008.49c56bdbBszuL1).
### Sipeed Lichee Pi 4A
Popular but slow [T-Head](https://www.t-head.cn/) RISC-V [TH1520](https://www.t-head.cn/product/yeying) SOC with a known silicon vulnerability. Scaleway [added serial support](https://x.com/seblu84/status/1795739245211951201) to their bare metal service but I couldn't get it working with mainline. The boot process is:
* Vendor U-Boot
* Chainload [mainline U-Boot at 0xc0100000](https://wiki.sipeed.com/hardware/en/lichee/th1520/lpi4a/7_develop.html#Mainline:~:text=Mainline%20U%2Dboot%20is%20expected%20to%20be%20loaded%20at%200x1c00000)


Resources:
* https://github.com/dlan17/u-boot/tree/th1520/net
* https://github.com/chainsx/thead-u-boot
* https://wiki.sipeed.com/hardware/en/lichee/th1520/lpi4a/7_develop.html
* https://github.com/u-boot/u-boot/blob/master/doc/board/thead/lpi4a.rst
* [Flashing an Image - Sipeed Wiki](https://wiki.sipeed.com/hardware/en/lichee/th1520/lpi4a/4_burn_image.html)
* https://github.com/chainsx/armbian-riscv-build/
* https://console.scaleway.com/elastic-metal/servers
* [Overlays | TALOS LINUX](https://www.talos.dev/v1.10/advanced/overlays/#authoring-overlays)

#TODO rebase when ready to test, add kernel configs for Lichee Pi serial, build ISO for UEFI

## Firmware
I saw "OpenSBI" crop up a few times when reading about firmware. This [explanation](https://www.thegoodpenguin.co.uk/blog/an-overview-of-opensbi/) was really helpful. Turns out Supervisor Binary Interface (SBI) is an optional higher-privilege supervisor firmware, like ARM Trusted Firmware (ATF) or BIOS/UEFI. OpenSBI is the reference implementation shipped in the Sipeed Lichee SBCs. I could use U-Boot/Talos in M-mode with vendor U-Boot doing DDR training etc, but then I have to partially flash the board which could be a pain. [This patchset](https://patchwork.ozlabs.org/project/uboot/list/?series=458992) swaps to S-mode and should allow a fully open firmware, so I'll try it first.

## Lichee Pi 4A flashing
Ctrl-C via serial during U-Boot
`ums 0 mmc 0`
Capture vhdx with Rufus
Flash with rufus

Boot button fastboot doesn't properly write u-boot, need to use `fastboot` in u-boot shell

Flash U-Boot, power while holding boot button then
```
docker create --entrypoint sh ghcr.io/pl4nty/sbc-riscv64:8bcc7b0
docker export -o overlay.tar.gz 789d322174957e61ebbd2c3e8bbcd7257e0266dde47fe0a1b6f450c0d1dec314
7z e overlay.tar.gz "artifacts/riscv64/u-boot/licheepi-4a/u-boot-with-spl.bin"

fastboot flash ram .\u-boot-with-spl.bin
fastboot flash uboot .\u-boot-with-spl.bin
fastboot reboot
```

https://github.com/revyos/thead-u-boot/blob/th1520/include/configs/light-c910.h#L75
https://github.com/revyos/thead-u-boot/blob/93ff49d9f5bbe7942f727ab93311346173506d27/configs/light_lpi4a_defconfig


![[Pasted image 20250609004449.png|Pasted image 20250609004449.png]]


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


```
[    0.000000] Linux version 5.10.113+ (ubuntu@ubuntu-2204-buildserver) (riscv64-unknown-linux-gnu-gcc (Xuantie-900 linux-5.10.4 glibc gcc Toolchain V2.6.1 B-20220906) 10.2.0, GNU ld (GNU Binutils) 2.35) #1 SMP PREEMPT Wed Dec 20 08:25:29 UTC 2023
[    0.000000] earlycon: uart0 at MMIO32 0x000000ffe7014000 (options '115200n8')
[    0.000000] printk: bootconsole [uart0] enabled
[    0.000000] efi: UEFI not found.
[    0.000000] Reserved memory: created CMA memory pool at 0x00000000e4000000, size 320 MiB
[    0.000000] OF: reserved mem: initialized node linux,cma, compatible id shared-dma-pool
[    0.000000] Zone ranges:
[    0.000000]   DMA32    [mem 0x0000000000200000-0x00000000ffffffff]
[    0.000000]   Normal   [mem 0x0000000100000000-0x00000001ffffffff]
[    0.000000] Movable zone start for each node
[    0.000000] Early memory node ranges
[    0.000000]   node   0: [mem 0x0000000000200000-0x000000000fffffff]
[    0.000000]   node   0: [mem 0x0000000010000000-0x00000000166fffff]
[    0.000000]   node   0: [mem 0x0000000016700000-0x0000000016ffffff]
[    0.000000]   node   0: [mem 0x0000000017000000-0x0000000018ffffff]
[    0.000000]   node   0: [mem 0x0000000019000000-0x000000001bffffff]
[    0.000000]   node   0: [mem 0x000000001c000000-0x000000001e00ffff]
[    0.000000]   node   0: [mem 0x000000001e010000-0x000000001fffffff]
[    0.000000]   node   0: [mem 0x0000000020000000-0x00000000207fffff]
[    0.000000]   node   0: [mem 0x0000000020800000-0x0000000031ffffff]
[    0.000000]   node   0: [mem 0x0000000032000000-0x00000000383fffff]
[    0.000000]   node   0: [mem 0x0000000038400000-0x00000001ffffffff]
[    0.000000] Initmem setup node 0 [mem 0x0000000000200000-0x00000001ffffffff]
[    0.000000] On node 0 totalpages: 2096640
[    0.000000]   DMA32 zone: 16376 pages used for memmap
[    0.000000]   DMA32 zone: 0 pages reserved
[    0.000000]   DMA32 zone: 1048064 pages, LIFO batch:63
[    0.000000]   Normal zone: 16384 pages used for memmap
[    0.000000]   Normal zone: 1048576 pages, LIFO batch:63
[    0.000000] software IO TLB: mapped [mem 0x00000000fbfff000-0x00000000fffff000] (64MB)
[    0.000000] SBI specification v0.3 detected
[    0.000000] SBI implementation ID=0x1 Version=0x9
[    0.000000] SBI v0.2 TIME extension detected
[    0.000000] SBI v0.2 IPI extension detected
[    0.000000] SBI v0.2 RFENCE extension detected
[    0.000000] SBI v0.2 HSM extension detected
[    0.000000] riscv: ISA extensions acdfimsuv
[    0.000000] riscv: ELF capabilities acdfimv
[    0.000000] percpu: Embedded 27 pages/cpu s73560 r8192 d28840 u110592
[    0.000000] pcpu-alloc: s73560 r8192 d28840 u110592 alloc=27*4096
[    0.000000] pcpu-alloc: [0] 0 [0] 1 [0] 2 [0] 3
[    0.000000] Built 1 zonelists, mobility grouping on.  Total pages: 2063880
[    0.000000] Kernel command line: root=/dev/mmcblk0p3 console=ttyS0,115200 rootwait rw earlycon clk_ignore_unused loglevel=7 eth= rootrwoptions=rw,noatime rootrwreset=yes
[    0.000000] Dentry cache hash table entries: 1048576 (order: 11, 8388608 bytes, linear)
[    0.000000] Inode-cache hash table entries: 524288 (order: 10, 4194304 bytes, linear)
[    0.000000] Sorting __ex_table...
[    0.000000] mem auto-init: stack:off, heap alloc:off, heap free:off
[    0.000000] Memory: 7543732K/8386560K available (12093K kernel code, 4241K rwdata, 4096K rodata, 331K init, 512K bss, 515148K reserved, 327680K cma-reserved)
[    0.000000] SLUB: HWalign=64, Order=0-3, MinObjects=0, CPUs=4, Nodes=1
[    0.000000] rcu: Preemptible hierarchical RCU implementation.
[    0.000000] rcu:     RCU restricting CPUs from NR_CPUS=8 to nr_cpu_ids=4.
[    0.000000]  Trampoline variant of Tasks RCU enabled.
[    0.000000]  Tracing variant of Tasks RCU enabled.
[    0.000000] rcu: RCU calculated value of scheduler-enlistment delay is 25 jiffies.
[    0.000000] rcu: Adjusting geometry for rcu_fanout_leaf=16, nr_cpu_ids=4
[    0.000000] NR_IRQS: 64, nr_irqs: 64, preallocated irqs: 0
[    0.000000] riscv-intc: 64 local interrupts mapped
[    0.000000] plic: interrupt-controller@ffd8000000: mapped 64 interrupts with 4 handlers for 8 contexts.
[    0.000000] random: get_random_bytes called from start_kernel+0x372/0x4d4 with crng_init=0
[    0.000000] riscv_timer_init_dt: Registering clocksource cpuid [0] hartid [0]
[    0.000000] clocksource: riscv_clocksource: mask: 0xffffffffffffffff max_cycles: 0x1623fa770, max_idle_ns: 881590404476 ns
[    0.000008] sched_clock: 64 bits at 3000kHz, resolution 333ns, wraps every 4398046511097ns
[    0.008764] Console: colour dummy device 80x25
[    0.013311] Calibrating delay loop (skipped), value calculated using timer frequency.. 6.00 BogoMIPS (lpj=12000)
[    0.023539] pid_max: default: 32768 minimum: 301
[    0.028379] LSM: Security Framework initializing
[    0.033169] Mount-cache hash table entries: 16384 (order: 5, 131072 bytes, linear)
[    0.040802] Mountpoint-cache hash table entries: 16384 (order: 5, 131072 bytes, linear)
[    0.051481] ASID allocator initialised with 65536 entries
[    0.057091] rcu: Hierarchical SRCU implementation.
[    0.062859] EFI services will not be available.
[    0.067933] smp: Bringing up secondary CPUs ...
[    0.075838] smp: Brought up 1 node, 4 CPUs
[    0.082045] devtmpfs: initialized
[    0.117119] clocksource: jiffies: mask: 0xffffffff max_cycles: 0xffffffff, max_idle_ns: 7645041785100000 ns
[    0.126942] futex hash table entries: 1024 (order: 4, 65536 bytes, linear)
[    0.143718] pinctrl core: initialized pinctrl subsystem
[    0.150425] NET: Registered protocol family 16
[    0.177568] DMA: preallocated 1024 KiB GFP_KERNEL pool for atomic allocations
[    0.186023] DMA: preallocated 1024 KiB GFP_KERNEL|GFP_DMA32 pool for atomic allocations
[    0.194210] audit: initializing netlink subsys (disabled)
[    0.199999] audit: type=2000 audit(0.132:1): state=initialized audit_enabled=0 res=1
[    0.200662] thermal_sys: Registered thermal governor 'step_wise'
[    0.208301] cpuidle: using governor ladder
[    0.218511] cpuidle: using governor menu
[    0.349159] HugeTLB registered 1.00 GiB page size, pre-allocated 0 pages
[    0.355990] HugeTLB registered 2.00 MiB page size, pre-allocated 0 pages
[    0.443141] raid6: int64x8  gen()   757 MB/s
[    0.515767] raid6: int64x8  xor()   410 MB/s
[    0.588387] raid6: int64x4  gen()   898 MB/s
[    0.660981] raid6: int64x4  xor()   551 MB/s
[    0.733566] raid6: int64x2  gen()  1003 MB/s
[    0.806141] raid6: int64x2  xor()   536 MB/s
[    0.878734] raid6: int64x1  gen()   833 MB/s
[    0.951367] raid6: int64x1  xor()   408 MB/s
[    0.955746] raid6: using algorithm int64x2 gen() 1003 MB/s
[    0.961275] raid6: .... xor() 536 MB/s, rmw enabled
[    0.966177] raid6: using intx1 recovery algorithm
[    0.972593] vgaarb: loaded
[    0.975844] SCSI subsystem initialized
[    0.979969] usbcore: registered new interface driver usbfs
[    0.985593] usbcore: registered new interface driver hub
[    0.991007] usbcore: registered new device driver usb
[    0.996727] mc: Linux media interface: v0.10
[    1.001130] videodev: Linux video capture interface: v2.00
[    1.007452] Advanced Linux Sound Architecture Driver Initialized.
[    1.014448] Bluetooth: Core ver 2.22
[    1.018152] NET: Registered protocol family 31
[    1.022625] Bluetooth: HCI device and connection manager initialized
[    1.029019] Bluetooth: HCI socket layer initialized
[    1.033930] Bluetooth: L2CAP socket layer initialized
[    1.039048] Bluetooth: SCO socket layer initialized
[    1.044635] clocksource: Switched to clocksource riscv_clocksource
[    1.961837] NET: Registered protocol family 2
[    1.966685] IP idents hash table entries: 131072 (order: 8, 1048576 bytes, linear)
[    1.981555] tcp_listen_portaddr_hash hash table entries: 4096 (order: 4, 65536 bytes, linear)
[    1.990187] TCP established hash table entries: 65536 (order: 7, 524288 bytes, linear)
[    1.998519] TCP bind hash table entries: 65536 (order: 8, 1048576 bytes, linear)
[    2.006880] TCP: Hash tables configured (established 65536 bind 65536)
[    2.013724] UDP hash table entries: 4096 (order: 5, 131072 bytes, linear)
[    2.020728] UDP-Lite hash table entries: 4096 (order: 5, 131072 bytes, linear)
[    2.028293] NET: Registered protocol family 1
[    2.033727] RPC: Registered named UNIX socket transport module.
[    2.039699] RPC: Registered udp transport module.
[    2.044433] RPC: Registered tcp transport module.
[    2.049166] RPC: Registered tcp NFSv4.1 backchannel transport module.
[    2.056408] PCI: CLS 0 bytes, default 64
[    2.061928] khv_probe, 164, irq: 64.
[    2.067269] Initialise system trusted keyrings
[    2.072202] workingset: timestamp_bits=46 max_order=21 bucket_order=0
[    2.095895] NFS: Registering the id_resolver key type
[    2.101055] Key type id_resolver registered
[    2.105278] Key type id_legacy registered
[    2.109537] nfs4filelayout_init: NFSv4 File Layout Driver Registering...
[    2.116286] nfs4flexfilelayout_init: NFSv4 Flexfile Layout Driver Registering...
[    2.123754] jffs2: version 2.2. (NAND) \xc2\xa9 2001-2006 Red Hat, Inc.
[    2.130686] fuse: init (API version 7.32)
[    2.135479] 9p: Installing v9fs 9p2000 file system support
[    2.230906] NET: Registered protocol family 38
[    2.235469] xor: measuring software checksum speed
[    2.244764]    8regs           :  2258 MB/sec
[    2.253531]    8regs_prefetch  :  2266 MB/sec
[    2.262708]    32regs          :  2069 MB/sec
[    2.271872]    32regs_prefetch :  2072 MB/sec
[    2.276260] xor: using function: 8regs_prefetch (2266 MB/sec)
[    2.282039] Key type asymmetric registered
[    2.286165] Asymmetric key parser 'x509' registered
[    2.291132] Block layer SCSI generic (bsg) driver version 0.4 loaded (major 247)
[    2.298821] io scheduler mq-deadline registered
[    2.303446] io scheduler kyber registered
[    2.309484] light-pinctrl ffe7f3c000.pinctrl1-apsys: initialized light pinctrl driver
[    2.317815] light-pinctrl ffec007000.padctrl0-apsys: initialized light pinctrl driver
[    2.326127] light-pinctrl fffff4a000.padctrl-aosys: initialized light pinctrl driver
[    2.334288] light-pinctrl ffcb01d000.padctrl-audiosys: initialized light pinctrl driver
[    2.350077] pwm-backlight pwm-backlight@0: supply power not found, using dummy regulator
[    2.373757] light-fm-clk ffef010000.clock-controller: succeed to register light fullmask clock driver
[    2.390997] visys-clk-gate-provider soc:visys-clk-gate: succeed to register visys gate clock provider
[    2.403544] vpsys-clk-gate-provider ffecc30000.vpsys-clk-gate: succeed to register vpsys gate clock provider
[    2.421354] vosys-clk-gate-provider ffef528000.vosys-clk-gate: succeed to register vosys gate clock provider
[    2.431878] dspsys-clk-gate-provider soc:dspsys-clk-gate: cannot find regmap for tee dsp system register
[    2.444757] dspsys-clk-gate-provider soc:dspsys-clk-gate: succeed to register dspsys gate clock provider
[    2.454933] light_audiosys_clk_probe audiosys_regmap=0xffffffe100893c00
[    2.468249] audiosys-clk-gate-provider soc:audiosys-clk-gate: succeed to register audiosys gate clock provider
[    2.479363] dw_axi_dmac_platform ffefc00000.dmac: DesignWare AXI DMA Controller, 4 channels
[    2.490006] dw_axi_dmac_platform ffc8000000.audio_dmac: DesignWare AXI DMA Controller, 16 channels
[    2.501159] (NULL device *): failed to find vdmabuf_reserved_memory node
[    2.507930] virtio-vdmabuf: carveout bufs setup failed -22
[    2.614476] Serial: 8250/16550 driver, 6 ports, IRQ sharing disabled
[    2.624847] printk: console [ttyS0] disabled
[    2.629262] ffe7014000.serial: ttyS0 at MMIO 0xffe7014000 (irq = 4, base_baud = 6250000) is a 16550A
[    2.638487] printk: console [ttyS0] enabled
[    2.646917] printk: bootconsole [uart0] disabled
[    2.658105] ffe7f00000.serial: ttyS1 at MMIO 0xffe7f00000 (irq = 6, base_baud = 6250000) is a 16550A
[    2.669013] fff7f08000.serial: ttyS4 at MMIO 0xfff7f08000 (irq = 8, base_baud = 6250000) is a 16550A
[    2.687372] vs-dc ffef600000.dc8200: dpu0pll_on:0 dpu1pll_on:1
[    2.697531] vs-drm display-subsystem: bound ffef600000.dc8200 (ops 0xffffffe000ec6098)
[    2.705788] dwhdmi-light ffef540000.dw-hdmi-tx: Detected HDMI TX controller v2.14a with HDCP (DWC HDMI 2.0 TX PHY)
[    2.717096] dwhdmi-light ffef540000.dw-hdmi-tx: registered DesignWare HDMI I2C bus driver
[    2.725718] vs-drm display-subsystem: bound ffef540000.dw-hdmi-tx (ops 0xffffffe000ec7860)
[    2.735385] [drm] Initialized vs-drm 1.0.0 20191101 for display-subsystem on minor 0
[    2.743320] vs-drm display-subsystem: [drm] Cannot find any crtc or sizes
[    2.766130] loop: module loaded
[    2.772320] spi_norflash@0 enforce active low on chipselect handle
[    2.779818] spi-nor spi0.0: unrecognized JEDEC id bytes: ff ff ff ff ff ff
[    2.786827] dw_spi_mmio ffe700c000.spi: cs1 >= max 1
[    2.791853] spi_master spi0: spi_device register error /soc/spi@ffe700c000/spidev@1
[    2.799567] spi_master spi0: Failed to create SPI device for /soc/spi@ffe700c000/spidev@1
[    2.808334] spidev@0 enforce active low on chipselect handle
[    2.819014] tun: Universal TUN/TAP device driver, 1.6
[    2.827235] ohci_hcd: USB 1.1 'Open' Host Controller (OHCI) Driver
[    2.833491] ohci-pci: OHCI PCI platform driver
[    2.839068] usbcore: registered new interface driver usb-storage
[    2.845167] usbcore: registered new interface driver ums-sddr09
[    2.851171] usbcore: registered new interface driver ums-sddr55
[    2.857571] mousedev: PS/2 mouse device common for all mice
[    2.864461] xgene-rtc fffff40000.rtc: registered as rtc0
[    2.869932] xgene-rtc fffff40000.rtc: setting system clock to 1970-01-01T00:00:00 UTC (0)
[    2.878504] i2c /dev entries driver
[    2.884250] hwmon hwmon0: temp2_input not attached to any thermal zone
[    2.891942] light_reset_deassert id:0
[    2.895677] dw_wdt ffefc30000.watchdog: No valid TOPs array specified
[    2.903073] light_reset_deassert id:1
[    2.906809] dw_wdt ffefc31000.watchdog: No valid TOPs array specified
[    2.914810] Watchdog module: light-wdt loaded
[    2.919815] device-mapper: ioctl: 4.44.0-ioctl (2021-02-01) initialised: dm-devel@redhat.com
[    2.928927] Bluetooth: HCI UART driver ver 2.2.0c90be4.20211102-175223
[    2.935505] Bluetooth: HCI H4 protocol initialized
[    2.940338] Bluetooth: HCI Realtek H5 protocol initialized
[    2.945872] rtk_btcoex: rtk_btcoex_init: version: 1.2
[    2.950958] rtk_btcoex: create workqueue
[    2.955196] rtk_btcoex: alloc buffers 1792, 2432 for ev and l2
[    2.963345] sdhci: Secure Digital Host Controller Interface driver
[    2.969588] sdhci: Copyright(c) Pierre Ossman
[    2.973983] sdhci-pltfm: SDHCI platform and OF driver helper
[    2.984780] usbcore: registered new interface driver usbhid
[    2.990436] usbhid: USB HID core driver
[    2.995315] misc vhost-vdmabuf: failed to find vdmabuf_reserved_memory node
[    3.002341] misc vhost-vdmabuf: vhost-vdmabuf: carveout bufs setup failed -22
[    3.009519] misc vhost-vdmabuf: vhost-vdmabuf: init successfully
[    3.010461] mmc0: SDHCI controller on ffe7080000.sdhci [ffe7080000.sdhci] using ADMA 64-bit
[    3.017486] thead,light-mbox-client mbox_910t_client2: Successfully registered
[    3.017654] mmc1: SDHCI controller on ffe7090000.sd [ffe7090000.sd] using ADMA 64-bit
[    3.040384] light-adc fffff51000.adc: Thead light adc registered.
[    3.048205] [perf] T-HEAD C900 PMU v1 probed
[    3.053482] light_efuse ffff210000.efuse: succeed to register light efuse driver
[    3.070711] IPVS: Registered protocols (TCP, UDP)
[    3.075593] IPVS: Connection hash table configured (size=4096, memory=64Kbytes)
[    3.083169] IPVS: ipvs loaded.
[    3.086278] IPVS: [rr] scheduler registered.
[    3.090791] IPv4 over IPsec tunneling driver
[    3.096172] Initializing XFRM netlink socket
[    3.101701] NET: Registered protocol family 10
[    3.104738] mmc2: SDHCI controller on ffe70a0000.sd [ffe70a0000.sd] using ADMA 64-bit
[    3.108030] Segment Routing with IPv6
[    3.118056] sit: IPv6, IPv4 and MPLS over IPv4 tunneling driver
[    3.125062] NET: Registered protocol family 17
[    3.129726] Bridge firewalling registered
[    3.134190] Bluetooth: RFCOMM TTY layer initialized
[    3.139134] Bluetooth: RFCOMM socket layer initialized
[    3.144370] Bluetooth: RFCOMM ver 1.11
[    3.148220] Bluetooth: BNEP (Ethernet Emulation) ver 1.3
[    3.153623] Bluetooth: BNEP socket layer initialized
[    3.158667] Bluetooth: HIDP (Human Interface Emulation) ver 1.2
[    3.164633] Bluetooth: HIDP socket layer initialized
[    3.169696] 8021q: 802.1Q VLAN Support v1.8
[    3.170158] mmc0: new HS400 MMC card at address 0001
[    3.173966] [WLAN_RFKILL]: Enter rfkill_wlan_init
[    3.180067] mmcblk0: mmc0:0001 AT2SAB 28.9 GiB
[    3.184177] [WLAN_RFKILL]: Enter rfkill_wlan_probe
[    3.188745] mmcblk0boot0: mmc0:0001 AT2SAB partition 1 4.00 MiB
[    3.193116] [WLAN_RFKILL]: can't find rockchip,grf property
[    3.199465] mmcblk0boot1: mmc0:0001 AT2SAB partition 2 4.00 MiB
[    3.204739] [WLAN_RFKILL]: wlan_platdata_parse_dt: wifi_chip_type = rtl8723ds
[    3.217897] [WLAN_RFKILL]: wlan_platdata_parse_dt: wifi power will enabled while kernel starting and keep on.
[    3.218093] mmcblk0rpmb: mmc0:0001 AT2SAB partition 3 4.00 MiB, chardev (245:0)
[    3.227892] [WLAN_RFKILL]: wlan_platdata_parse_dt: wifi power controled by gpio.
[    3.240517]  mmcblk0: p1 p2 p3
[    3.242765] [WLAN_RFKILL]: wlan_platdata_parse_dt: The ref_wifi_clk not found !
[    3.253104] [WLAN_RFKILL]: rfkill_wlan_probe: init gpio
[    3.258370] [WLAN_RFKILL]: rockchip_wifi_power: 1
[    3.263108] [BT_RFKILL]: rfkill_get_bt_power_state: rfkill-bt driver has not Successful initialized
[    3.272183] [WLAN_RFKILL]: wifi turn on power. -1
[    3.276921] [WLAN_RFKILL]: Exit rfkill_wlan_probe
[    3.281802] [BT_RFKILL]: Enter rfkill_rk_init
[    3.286697] [BT_RFKILL]: bluetooth_platdata_parse_dt: uart_rts_gpios is no-in-use.
[    3.294364] [BT_RFKILL]: bluetooth_platdata_parse_dt: clk_get failed!!!.
[    3.301273] [BT_RFKILL]: bt_default device registered.
[    3.306797] 9pnet: Installing 9P2000 support
[    3.311189] Key type dns_resolver registered
[    3.315889] NET: Registered protocol family 40
[    3.321133] registered taskstats version 1
[    3.325290] Loading compiled-in X.509 certificates
[    3.333864] Btrfs loaded, crc32c=crc32c-generic

[    3.340122] ********************************************************************
[    3.347608] **     NOTICE NOTICE NOTICE NOTICE NOTICE NOTICE NOTICE           **
[    3.355086] **                                                                **
[    3.362531] **  WRITEABLE clk DebugFS SUPPORT HAS BEEN ENABLED IN THIS KERNEL **
[    3.369995] **                                                                **
[    3.377422] ** This means that this kernel is built to expose clk operations  **
[    3.384852] ** such as parent or rate setting, enabling, disabling, etc.      **
[    3.392278] ** to userspace, which may compromise security on your system.    **
[    3.399699] **                                                                **
[    3.407142] ** If you see this message and you are not debugging the          **
[    3.414570] ** kernel, report this immediately to your vendor!                **
[    3.421993] **                                                                **
[    3.429416] **     NOTICE NOTICE NOTICE NOTICE NOTICE NOTICE NOTICE           **
[    3.436842] ********************************************************************
[    3.508417] pca953x 0-0018: supply vcc not found, using dummy regulator
[    3.515386] pca953x 0-0018: using no AI
[    3.520943] i2c_designware ffe7f20000.i2c: i2c_dw_handle_tx_abort: lost arbitration
[    3.530237] i2c_designware ffe7f20000.i2c: i2c_dw_handle_tx_abort: lost arbitration
[    3.539602] i2c_designware ffe7f20000.i2c: i2c_dw_handle_tx_abort: lost arbitration
[    3.548859] i2c_designware ffe7f20000.i2c: i2c_dw_handle_tx_abort: lost arbitration
[    3.556621] pca953x 0-0018: failed writing register
[    3.561960] pca953x: probe of 0-0018 failed with error -11
[    3.569061] pca953x 1-0018: supply vcc not found, using dummy regulator
[    3.575966] pca953x 1-0018: using no AI
[    3.581379] i2c_designware ffe7f24000.i2c: i2c_dw_handle_tx_abort: lost arbitration
[    3.590611] i2c_designware ffe7f24000.i2c: i2c_dw_handle_tx_abort: lost arbitration
[    3.599818] i2c_designware ffe7f24000.i2c: i2c_dw_handle_tx_abort: lost arbitration
[    3.609023] i2c_designware ffe7f24000.i2c: i2c_dw_handle_tx_abort: lost arbitration
[    3.616772] pca953x 1-0018: failed writing register
[    3.622060] pca953x: probe of 1-0018 failed with error -11
[    3.630287] pca953x 3-0018: supply vcc not found, using dummy regulator
[    3.637318] pca953x 3-0018: using no AI
[    3.642326] i2c_designware ffec014000.i2c: i2c_dw_handle_tx_abort: lost arbitration
[    3.651107] i2c_designware ffec014000.i2c: i2c_dw_handle_tx_abort: lost arbitration
[    3.659870] i2c_designware ffec014000.i2c: i2c_dw_handle_tx_abort: lost arbitration
[    3.668692] i2c_designware ffec014000.i2c: i2c_dw_handle_tx_abort: lost arbitration
[    3.676477] pca953x 3-0018: failed writing register
[    3.681776] pca953x: probe of 3-0018 failed with error -11
[    3.691623] pwm-light ffec01c000.pwm: succeed to add a pwm chip
[    3.697895] pwm-backlight pwm-backlight@0: supply power not found, using dummy regulator
[    3.707008] light_dwmac_eth ffe7070000.ethernet: IRQ eth_wake_irq not found
[    3.714036] light_dwmac_eth ffe7070000.ethernet: IRQ eth_lpi not found
[    3.720817] light_dwmac_eth ffe7070000.ethernet: Cannot get CSR clock
[    3.727315] light_dwmac_eth ffe7070000.ethernet: PTP uses main clock
[    3.733715] light_dwmac_eth ffe7070000.ethernet: no reset control found
[    3.740379] light_dwmac_eth ffe7070000.ethernet: id: 0
[    3.745559] light_dwmac_eth ffe7070000.ethernet: phy interface: 9
[    3.751753] RX clk delay: 0x0
[    3.754760] TX clk delay: 0x0
[    3.758190] light_dwmac_eth ffe7070000.ethernet: User ID: 0x10, Synopsys ID: 0x37
[    3.765738] light_dwmac_eth ffe7070000.ethernet:     DWMAC1000
[    3.771350] light_dwmac_eth ffe7070000.ethernet: DMA HW capability register supported
[    3.779216] light_dwmac_eth ffe7070000.ethernet: RX Checksum Offload Engine supported
[    3.787076] light_dwmac_eth ffe7070000.ethernet: COE Type 2
[    3.792702] light_dwmac_eth ffe7070000.ethernet: TX Checksum insertion supported
[    3.800131] light_dwmac_eth ffe7070000.ethernet: Enhanced/Alternate descriptors
[    3.807467] light_dwmac_eth ffe7070000.ethernet: Enabled extended descriptors
[    3.814632] light_dwmac_eth ffe7070000.ethernet: Ring mode enabled
[    3.820844] light_dwmac_eth ffe7070000.ethernet: Enable RX Mitigation via HW Watchdog Timer
[    3.829263] light_dwmac_eth ffe7070000.ethernet: Using 0 bits DMA width,skb alloc dma32 flag 4
[    3.844329] light_dwmac_eth ffe7060000.ethernet: IRQ eth_wake_irq not found
[    3.851377] light_dwmac_eth ffe7060000.ethernet: IRQ eth_lpi not found
[    3.858074] light_dwmac_eth ffe7060000.ethernet: Cannot get CSR clock
[    3.864572] light_dwmac_eth ffe7060000.ethernet: PTP uses main clock
[    3.870973] light_dwmac_eth ffe7060000.ethernet: no reset control found
[    3.877660] light_dwmac_eth ffe7060000.ethernet: id: 1
[    3.882845] light_dwmac_eth ffe7060000.ethernet: phy interface: 9
[    3.889042] RX clk delay: 0x0
[    3.892021] TX clk delay: 0x0
[    3.895396] light_dwmac_eth ffe7060000.ethernet: User ID: 0x10, Synopsys ID: 0x37
[    3.902988] light_dwmac_eth ffe7060000.ethernet:     DWMAC1000
[    3.908712] light_dwmac_eth ffe7060000.ethernet: DMA HW capability register supported
[    3.916596] light_dwmac_eth ffe7060000.ethernet: RX Checksum Offload Engine supported
[    3.924475] light_dwmac_eth ffe7060000.ethernet: COE Type 2
[    3.930101] light_dwmac_eth ffe7060000.ethernet: TX Checksum insertion supported
[    3.937535] light_dwmac_eth ffe7060000.ethernet: Enhanced/Alternate descriptors
[    3.944884] light_dwmac_eth ffe7060000.ethernet: Enabled extended descriptors
[    3.952051] light_dwmac_eth ffe7060000.ethernet: Ring mode enabled
[    3.958278] light_dwmac_eth ffe7060000.ethernet: Enable RX Mitigation via HW Watchdog Timer
[    3.966669] light_dwmac_eth ffe7060000.ethernet: Using 0 bits DMA width,skb alloc dma32 flag 4
[    4.011554] succeed to create power domain debugfs direntry
[    4.019529] soc_vdd_3v3_en GPIO handle specifies active low - ignored
[    4.027464] soc_vdd5v_se_en GPIO handle specifies active low - ignored
[    4.034846] soc_wcn33_en GPIO handle specifies active low - ignored
[    4.042067] soc_vbus_en GPIO handle specifies active low - ignored
[    4.069348] random: fast init done
[    4.083282] cpufreq: cpufreq_online: CPU0: Running at unlisted initial frequency: 750000 KHz, changing to: 800000 KHz
[    4.094392] cpu cpu0: finish to register cpufreq driver
[    4.100375] thead,light-aon-test aon:light-aon-test: Successfully registered
[    4.113426] light-event soc:light-event: failed to set aon reservemem
[    4.119950] light-event soc:light-event: set aon reservemem failed!
[    4.126362] light-event: probe of soc:light-event failed with error -1
[    4.135219] [light_wdt_probe,329] register power off callback
[    4.141060] succeed to register light pmic watchdog
[    4.150646] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.167622] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.179095] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.190812] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.202253] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.213659] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.225054] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.236442] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.247829] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.259209] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.270581] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.281959] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.293329] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.304693] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.316085] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.327492] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.338861] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.350231] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.361592] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.372946] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.384282] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.395643] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.407029] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[    4.418461] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[    4.429769] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[    4.441063] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[    4.452355] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[    4.467528] es7210_probe: read chipid failed -1
[    4.475230] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[    4.487005] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[    4.510678] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[    4.522113] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[    4.530558] debugfs: File 'ES8156 SDOUT' in directory 'dapm' already present!
[    4.540774] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[    4.552354] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[    4.563745] input: gpio-keys as /devices/platform/gpio-keys/input/input0
[    4.571424] light rpmsg: Ready for cross core communication!
[    4.577202] light rpmsg: rproc_name = m4
[    4.608156] virtio_rpmsg_bus virtio0: creating channel rpmsg-virtual-char-channel-1 addr 0xee
[    5.109155] virtio_rpmsg_bus virtio0: rpmsg host is online
[    5.115661] light rpmsg: driver is registered.
[    5.120818] cfg80211: Loading compiled-in X.509 certificates for regulatory database
[    5.137119] cfg80211: Loaded X.509 cert 'sforshee: 00b28ddf47aef9cea7'
[    5.144097] platform regulatory.0: Direct firmware load for regulatory.db failed with error -2
[    5.144659] clk: Not disabling unused clocks
[    5.152753] cfg80211: failed to load regulatory.db
[    5.157077] ALSA device list:
[    5.164872]   #0: Light-Sound-Card
[    5.168780] dw-apb-uart ffe7014000.serial: forbid DMA for kernel console
[    5.260032] EXT4-fs (mmcblk0p3): recovery complete
[    5.265131] EXT4-fs (mmcblk0p3): mounted filesystem with ordered data mode. Opts: (null)
[    5.273302] VFS: Mounted root (ext4 filesystem) on device 179:3.
[    5.281174] devtmpfs: mounted
[    5.284275] Freeing unused kernel memory: 328K
[    5.289192] Run /sbin/init as init process
[    5.293381]   with arguments:
[    5.293386]     /sbin/init
[    5.293390]   with environment:
[    5.293394]     HOME=/
[    5.293397]     TERM=linux
[    5.293402]     eth=
[    5.293406]     rootrwoptions=rw,noatime
[    5.293409]     rootrwreset=yes
[    5.491165] systemd[1]: System time before build time, advancing clock.
[    5.547270] systemd[1]: systemd 252.6-1 running in system mode (+PAM +AUDIT +SELINUX +APPARMOR +IMA +SMACK +SECCOMP +GCRYPT -GNUTLS +OPENSSL +ACL +BLKID +CURL +ELFUTILS +FIDO2 +IDN2 -IDN +IPTC +KMOD +LIBCRYPTSETUP +LIBFDISK +PCRE2 -PWQUALITY +P11KIT +QRENCODE +TPM2 +BZIP2 +LZ4 +XZ +ZLIB +ZSTD -BPF_FRAMEWORK -XKBCOMMON +UTMP +SYSVINIT default-hierarchy=unified)
[    5.579238] systemd[1]: Detected architecture riscv64.
[    5.606431] systemd[1]: Hostname set to <lpi4a>.
[    5.968008] systemd[1]: Configuration file /etc/systemd/system/firstboot.service is marked executable. Please remove executable permission bits. Proceeding anyway.
[    6.124715] systemd[1]: Queued start job for default target graphical.target.
[    6.137277] systemd[1]: Created slice system-getty.slice - Slice /system/getty.
[    6.170129] systemd[1]: Created slice system-modprobe.slice - Slice /system/modprobe.
[    6.205762] systemd[1]: Created slice system-serial\x2dgetty.slice - Slice /system/serial-getty.
[    6.239307] systemd[1]: Created slice user.slice - User and Session Slice.
[    6.265446] systemd[1]: Started systemd-ask-password-console.path - Dispatch Password Requests to Console Directory Watch.
[    6.294548] systemd[1]: Started systemd-ask-password-wall.path - Forward Password Requests to Wall Directory Watch.
[    6.329279] systemd[1]: Set up automount proc-sys-fs-binfmt_misc.automount - Arbitrary Executable File Formats File System Automount Point.
[    6.361026] systemd[1]: Reached target cryptsetup.target - Local Encrypted Volumes.
[    6.384895] systemd[1]: Reached target integritysetup.target - Local Integrity Protected Volumes.
[    6.412928] systemd[1]: Reached target paths.target - Path Units.
[    6.436881] systemd[1]: Reached target remote-cryptsetup.target - Remote Encrypted Volumes.
[    6.464878] systemd[1]: Reached target remote-fs.target - Remote File Systems.
[    6.492875] systemd[1]: Reached target remote-veritysetup.target - Remote Verity Protected Volumes.
[    6.521633] systemd[1]: Reached target slices.target - Slice Units.
[    6.544909] systemd[1]: Reached target swap.target - Swaps.
[    6.568930] systemd[1]: Reached target veritysetup.target - Local Verity Protected Volumes.
[    6.599293] systemd[1]: Listening on systemd-fsckd.socket - fsck to fsckd communication Socket.
[    6.629605] systemd[1]: Listening on systemd-initctl.socket - initctl Compatibility Named Pipe.
[    6.660060] systemd[1]: Listening on systemd-journald-audit.socket - Journal Audit Socket.
[    6.691218] systemd[1]: Listening on systemd-journald-dev-log.socket - Journal Socket (/dev/log).
[    6.721889] systemd[1]: Listening on systemd-journald.socket - Journal Socket.
[    6.750425] systemd[1]: Listening on systemd-networkd.socket - Network Service Netlink Socket.
[    6.788909] systemd[1]: Listening on systemd-udevd-control.socket - udev Control Socket.
[    6.818748] systemd[1]: Listening on systemd-udevd-kernel.socket - udev Kernel Socket.
[    6.849830] systemd[1]: Mounting dev-hugepages.mount - Huge Pages File System...
[    6.877099] systemd[1]: Mounting dev-mqueue.mount - POSIX Message Queue File System...
[    6.919988] systemd[1]: Mounting sys-kernel-debug.mount - Kernel Debug File System...
[    6.952308] systemd[1]: Mounting sys-kernel-tracing.mount - Kernel Trace File System...
[    6.977203] systemd[1]: kmod-static-nodes.service - Create List of Static Device Nodes was skipped because of an unmet condition check (ConditionFileNotEmpty=/lib/modules/5.10.113+/modules.devname).
[    7.000228] systemd[1]: Starting modprobe@configfs.service - Load Kernel Module configfs...
[    7.030351] systemd[1]: Starting modprobe@dm_mod.service - Load Kernel Module dm_mod...
[    7.062485] systemd[1]: Starting modprobe@drm.service - Load Kernel Module drm...
[    7.093731] systemd[1]: Starting modprobe@efi_pstore.service - Load Kernel Module efi_pstore...
[    7.142837] systemd[1]: Starting modprobe@fuse.service - Load Kernel Module fuse...
[    7.177998] systemd[1]: Starting modprobe@loop.service - Load Kernel Module loop...
[    7.213011] systemd[1]: Starting nftables.service - nftables...
[    7.233288] systemd[1]: systemd-fsck-root.service - File System Check on Root Device was skipped because of an unmet condition check (ConditionPathIsReadWrite=!/).
[    7.254476] systemd[1]: Starting systemd-journald.service - Journal Service...
[    7.285171] systemd[1]: Starting systemd-modules-load.service - Load Kernel Modules...
[    7.312995] systemd[1]: Starting systemd-network-generator.service - Generate network units from Kernel command line...
[    7.320038] vidmem ffecc08000.vidmem: rsvmem_pool_create: rsvmem_pool_region[0] = {pool=ffffffe101b7ec80, base=0x10000000, size=0x2c00000}
[    7.336565] vidmem ffecc08000.vidmem: rsvmem_pool_create: rsvmem_pool_region[1] = {pool=ffffffe101b7ed40, base=0x12c00000, size=0x1d00000}
[    7.349065] vidmem ffecc08000.vidmem: rsvmem_pool_create: rsvmem_pool_region[2] = {pool=ffffffe101b7ee00, base=0x14900000, size=0x1e00000}
[    7.362027] vidmem: module inserted. Major <244>
[    7.385341] hantrodec: module is from the staging directory, the quality is unknown, you have been warned.
[    7.388817] systemd[1]: Starting systemd-remount-fs.service - Remount Root and Kernel File Systems...
[    7.418931] enter hantrodec_init
[    7.422081] EXT4-fs (mmcblk0p3): re-mounted. Opts: (null)
[    7.422460] enter decoder_hantrodec_probe
[    7.431685] pcie=0
[    7.433742] decoder_hantrodec_probe:init variable is ok!
[    7.435699] systemd[1]: Starting systemd-udev-trigger.service - Coldplug All udev Devices...
[    7.439085] decoder_hantrodec_probe:get resource is ok!
[    7.439092] decoder_hantrodec_probe:start get irq!
[    7.439097] hantrodec: vcmd = 1
[    7.439108] hantrodec: [0] multicorebase 0xffecc01000, iosize 4092
[    7.467243] decoder_hantrodec_probe:get irq!
[    7.471568] decoder_hantrodec_probe:base_port=0xffecc00000,irq=30
[    7.477720] decoder_hantrodec_probe:pcie=0
[    7.481850] hantrodec: dec/pp kernel module.
[    7.487603] hantrodec: Init single core at 0xffecc00000 IRQ=30
[    7.494821] hantrodec_data.irq=30
[    7.499846] hantrodec: base=0x      ffecc01000, iosize=4092
[    7.506538] hantrodec: HW 0 reg[0]=0x80018000
[    7.512279] hantrodec: base=0x      ffecc00000, iosize=108
[    7.517997] hantrodec: HW 3 reg[0]=0x43421101
[    7.522426] hantrodec: base=0x      ffecc03000, iosize=912
[    7.527975] hantrodec: HW 4 reg[0]=0x00000000
[    7.532385] hantrodec: base=0x      ffecc06000, iosize=6272
[    7.534750] systemd[1]: Started systemd-journald.service - Journal Service.
[    7.538031] hantrodec: HW 6 reg[0]=0x00000000
[    7.538043] hantrodec: base=0x      ffecc02000, iosize=924
[    7.554977] hantrodec: HW 7 reg[0]=0x00005000
[    7.559384] hantrodec: core 0 HW ID=0x80018000
[    7.563866] hantrodec: Supported HW found at 0x      ffecc01000
[    7.569824]  *****MMU Init*****
[    7.574546] Create platform device success
[    7.580335] Platform driver status is 0
[    7.585083] MMU detected!
[    7.589085]  *****MMU Enable...*****
[    7.633004] decoder_hantrodec ffecc00000.vdec: Create vc8000d debugfs.
[    7.685489] Base memory val 0xe4b00000
[    7.689285] Base memory len 0x900000
[    7.689289] Init: vcmd_buf_mem_pool.busAddress=0xe4b00000.
[    7.689292] Init: vcmd_buf_mem_pool.virtualAddress=0xffffffd00535c000.
[    7.689318] Init: vcmd_buf_mem_pool.mmu_bus_address=0x1000.
[    7.710534] Init: vcmd_status_buf_mem_pool.busAddress=0xe4d00000.
[    7.718036] Init: vcmd_status_buf_mem_pool.virtualAddress=0xffffffd00555c000.
[    7.726577] Init: vcmd_status_buf_mem_pool.mmu_bus_address=0x201000.
[    7.734295] Init: vcmd_registers_mem_pool.busAddress=0xe4f00000.
[    7.741687] Init: vcmd_registers_mem_pool.virtualAddress=0xffffffd00575c000.
[    7.750175] Init: vcmd_registers_mem_pool.mmu_bus_address=0x401000.
[    7.757604] vcmd: module init - vcmdcore[0] addr =0xffecc00000
[    7.763502] hwid=0x43421101
[    7.766330] hantrovcmd: HW at base <0xffecc00000> with ID <0x43421101>
[    7.772950] hantrovcmd_init:get irq 30
[    7.776850] vc8000_vcmd_driver: request IRQ <30> successfully for subsystem 0
[    7.785422] vc8000_vcmd_driver:create cmdbuf data when hw_version_id = 0x43421101
[    7.794313] vc8000_vcmd_driver: main module register 0:0x80018000
[    7.801776] vc8000_vcmd_driver: main module register 50:0x6b9a1000
[    7.809323] vc8000_vcmd_driver: main module register 54:0x01da0440
[    7.816870] vc8000_vcmd_driver: main module register 56:0x48801000
[    7.824260] vc8000_vcmd_driver: main module register 309:0x1f88
[    7.830237] PM runtime was enable
[    7.845987] memalloc: module is from the staging directory, the quality is unknown, you have been warned.
[    7.858235] memalloc: Linear Memory Allocator
[    7.862650] memalloc: Linear memory base = 0x2000000
[    7.862660] memalloc: Total size 96 MB; 6144 chunks of size 16384
[    7.876919] vc8000: module is from the staging directory, the quality is unknown, you have been warned.
[    7.903898] hantroenc_vcmd_probe:get irq 31
[    7.953098] Base memory val 0xe5400000
[    7.958299] Init: vcmd_buf_mem_pool.busAddress=0xe5400000.
[    7.963868] Init: vcmd_buf_mem_pool.virtualAddress=0xffffffd005c5d000.
[    7.970436] Init: vcmd_status_buf_mem_pool.busAddress=0xe5600000.
[    7.976573] Init: vcmd_status_buf_mem_pool.virtualAddress=0xffffffd005e5d000.
[    7.976577] Init: vcmd_registers_mem_pool.busAddress=0xe5800000.
[    7.976580] Init: vcmd_registers_mem_pool.virtualAddress=0xffffffd00605d000.
[    7.976583] vcmd: module init - vcmdcore[0] addr =0xffecc10000
[    7.976656] encoder_hantroenc ffecc10000.venc: Create vc8000e debugfs.
[    8.010769] ConfigMMU, MMUInit: sub_module_type is 0
[    8.017019]  *****MMU Init*****
[    8.021704] Create platform device success
[    8.026593] Platform driver status is 0
[    8.030474] MMU detected!
[    8.033122]  *****MMU Enable...*****
[    8.078982] MMU_Kernel_map: vcmd_buf_mem_pool.mmu_bus_address=0x40002000.
[    8.086310] MMU_Kernel_map: vcmd_status_buf_mem_pool.mmu_bus_address=0x40202000.
[    8.095129] MMU_Kernel_map: vcmd_registers_mem_pool.mmu_bus_address=0x40402000.
[    8.103946] vcmd_reserve_IO: total_vcmd_core_num is 1
[    8.110049] vcmd_reserve_IO: hantrovcmd_data[0].hwregs=0x(____ptrval____)
[    8.116940] hwid=0x43421200
[    8.119742] hantrovcmd: HW at base <0xffecc10000> with ID <0x43421200>
[    8.126391] vc8000_vcmd_driver: module inserted. Major <241>
[    8.132163] vc8000_vcmd_driver:create cmdbuf data when hw_version_id = 0x43421200
[    8.139735] vc8000_vcmd_driver: main module register 0:0x80008200
[    8.147249] vc8000_vcmd_driver: main module register 80:0x88dfc200
[    8.154815] vc8000_vcmd_driver: main module register 214:0x48400800
[    8.162461] vc8000_vcmd_driver: main module register 226:0x8a19211
[    8.170027] vc8000_vcmd_driver: main module register 287:0x20830000
[    8.248051] systemd-journald[203]: Received client request to flush runtime journal.
[    8.258189] systemd-journald[203]: File /var/log/journal/62352657dbd24046bf72483b27b5fd18/system.journal corrupted or uncleanly shut down, renaming and replacing.
[    8.824549] light_dwmac_eth ffe7070000.ethernet end0: renamed from eth0
[    8.878518] light_dwmac_eth ffe7060000.ethernet end1: renamed from eth1
[    9.679983] random: alsactl: uninitialized urandom read (4 bytes read)
[   10.573096] EXT4-fs (mmcblk0p2): recovery complete
[   10.578033] EXT4-fs (mmcblk0p2): mounted filesystem with ordered data mode. Opts: (null)
[   11.020090] [BT_RFKILL]: bt shut off power
[   11.497914] PVR_K:  241: *****enter sys dev init ffef400000 28

[   11.505468] PVR_K:  241: Read BVNC 36.52.104.182 from HW device registers
[   11.512443] PVR_K:  241: RGX Device registered BVNC 36.52.104.182 with 1 core in the system
[   11.521837] [drm] Initialized pvr 1.17.6210866 20170530 for ffef400000.gpu on minor 1
[   11.660835] systemd-journald[203]: Oldest entry in /var/log/journal/62352657dbd24046bf72483b27b5fd18/system.journal is older than the configured file retention duration (1month), suggesting rotation.
[   11.678655] systemd-journald[203]: /var/log/journal/62352657dbd24046bf72483b27b5fd18/system.journal: Journal header limits reached or header out-of-date, rotating.
[   12.059542] random: alsactl: uninitialized urandom read (4 bytes read)
[   12.117462] random: blueman-mechani: uninitialized urandom read (24 bytes read)
[   12.148248] random: dbus-daemon: uninitialized urandom read (12 bytes read)
[   12.950204] vha_plat_probe: Version: VHA DT driver version : REL_3.8-cl6140200

[   12.959351] vha_plat_probe: registers 0xfffc800000-0xfffc8fffff
[   12.966635] ax3xxx-nna fffc800000.vha: trimming system conf for core region!
[   12.975096] ax3xxx-nna fffc800000.vha: vha_plat_dt_hw_init dev->dma_mask : (____ptrval____) : 0xffffffff
[   12.985503] ax3xxx-nna fffc800000.vha: vha_plat_dt_hw_init forcing custom mask from DT : 0xffffffffff
[   12.994819] ax3xxx-nna fffc800000.vha: vha_dev_get_props: Product id: 0x8470000
[   13.002295] ax3xxx-nna fffc800000.vha: vha_dev_get_props: Core id: 0x1c0004190005de
[   13.010030] ax3xxx-nna fffc800000.vha: vha_dev_get_props: MMU version:3 (40bit)
[   13.017440] ax3xxx-nna fffc800000.vha: vha_dev_get_props: Total onchip memory: 1024 [kB]
[   13.025605] ax3xxx-nna fffc800000.vha: vha_dev_get_props: Devices: DUMMY:0 CNN:1
[   13.034132] ax3xxx-nna fffc800000.vha: vha_add_dev: Core freq[kHz]: 792000
[   13.075988] urandom_read: 2 callbacks suppressed
[   13.075995] random: lightdm: uninitialized urandom read (16 bytes read)
[   13.235544] random: Xorg: uninitialized urandom read (8 bytes read)
[   13.247520] random: Xorg: uninitialized urandom read (8 bytes read)
[   13.367044] PVR_K:  410: RGX Firmware image 'rgx.fw.36.52.104.182' loaded
[   13.376220] PVR_K:  410: *****enter sysintstall LISR

[   13.387623] PVR_K:  410: Shader binary image 'rgx.sh.36.52.104.182' loaded
[   13.556844] light_dwmac_eth ffe7070000.ethernet end0: PHY [stmmac-0:01] driver [RTL8211F Gigabit Ethernet] (irq=POLL)
[   13.574381] dwmac1000: Master AXI performs fixed burst length
[   13.581746] light_dwmac_eth ffe7070000.ethernet end0: No Safety Features support found
[   13.796474] light_dwmac_eth ffe7070000.ethernet end0: IEEE 1588-2008 Advanced Timestamp supported
[   13.818076] light_dwmac_eth ffe7070000.ethernet end0: configuring for phy/rgmii-id link mode
[   13.904803] light_dwmac_eth ffe7060000.ethernet end1: PHY [stmmac-0:02] driver [RTL8211F Gigabit Ethernet] (irq=POLL)
[   13.927981] dwmac1000: Master AXI performs fixed burst length
[   13.934121] light_dwmac_eth ffe7060000.ethernet end1: No Safety Features support found
[   14.142161] light_dwmac_eth ffe7060000.ethernet end1: IEEE 1588-2008 Advanced Timestamp supported
[   14.151673] light_dwmac_eth ffe7060000.ethernet end1: configuring for phy/rgmii-id link mode
[   16.935164] random: crng init done
[   16.938592] random: 1 urandom warning(s) missed due to ratelimiting
[   17.395066] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[   17.406459] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.417786] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.428879] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.440259] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.451286] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.462314] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.473267] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.484454] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.495471] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.506485] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.517878] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.528868] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.539914] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.550985] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.561979] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.573890] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.585995] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.597767] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.609760] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.620737] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.631733] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.642850] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[   17.653977] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[   17.718163] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   17.729171] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   17.740557] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   17.751463] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   17.762398] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   17.773450] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   17.784509] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   17.795493] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   17.806474] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   17.817401] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   17.828301] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   17.839943] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[   17.851202] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[   17.862504] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.873917] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.886088] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.897806] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.909817] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.920784] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.931745] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.942777] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   17.944799] light_dwmac_eth ffe7070000.ethernet end0: Link is Up - 1Gbps/Full - flow control rx/tx
[   17.969767] IPv6: ADDRCONF(NETDEV_CHANGE): end0: link becomes ready
[   18.471823] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.480386] es8156_set_bias_level codec_uninit_sequence
[   18.511186] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[   18.524281] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.535079] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.546138] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.557053] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.567874] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.578705] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.589557] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.600386] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.611207] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.623101] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.634302] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.647075] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.660764] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.673633] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.684823] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.696159] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.708560] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.719866] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.731114] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.742521] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.754929] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   18.766149] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[   18.777532] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[   18.836070] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   18.847218] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   18.858430] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   18.869461] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   18.880574] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   18.891735] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   18.902663] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   18.913683] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   18.924749] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   18.935677] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   18.946640] es8156 6-0008: ASoC: error at soc_component_read_no_lock on es8156.6-0008: -121
[   24.316160] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[   24.327125] es8156 6-0008: ASoC: error at snd_soc_component_update_bits on es8156.6-0008: -121
[   24.341312] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   24.353799] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   24.365603] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   24.376425] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   24.388924] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   24.401827] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   24.412531] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   24.424847] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   25.081488] es8156 6-0008: ASoC: error at soc_component_write_no_lock on es8156.6-0008: -121
[   25.090174] es8156_set_bias_level codec_uninit_sequence
[   35.893103] soc_dovdd18_scan: disabling
[   35.897582] soc_dvdd12_scan: disabling
[   35.902054] soc_avdd28_scan_en: disabling

sipeed@lpi4a:~$ ls /boot
Image                      dtbs            initrd.img-5.10.113-lpi4a  lost+found
System.map-5.10.113-lpi4a  extlinux        light_aon_fpga.bin         vmlinux-5.10.113-lpi4a
config-5.10.113-lpi4a      fw_dynamic.bin  light_c906_audio.bin
```

got tired of waiting for a LicheePi module 3A, so I skimmed the LM4A pinout and bought one thinking it'd at least boot. well it got even further - networking works out of the box. no serial though, not sure which kernel args to use or anything else to try. the LM4A has equivalent pins for RK1's UART2, UART6, and UART9 TX/RX so it should be possible

not so lucky on flashing, at least on BMC v2.0.5. will try v2.1.0 tomorrow, but my last BMC upgrade attempt caused intermittent reboots and corrupted my storage. I don't think the LM4A pins for usb boot select match anyway. error was https://github.com/turing-machines/bmcd/blob/36a9800e945c839893dd49a14a570e6202d1f662/src/hal/usbboot.rs#L52