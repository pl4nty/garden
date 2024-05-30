---
{"dg-publish":true,"permalink":"/hardware/risc-v/"}
---

## Talos Bringup
RISC-V SBCs like the Lichee Pi 4 and [Sipeed LM3A/5A](https://twitter.com/sipeedio/status/1778612306613829871) are starting to hit the market, so I thought I'd start on Talos support early. I worked in this order:

* bldr
* pkgs ca-certs and fhs
* bldr with pkgs
* toolchain
* tools
* pkgs
* talos

Images can be downloaded or built from my [GitHub fork](https://github.com/pl4nty/talos). I installed [[Cloud/BuildKit\|BuildKit]] on a [Scaleway RISC-V server](https://labs.scaleway.com/en/em-rv1/) for native builds via GitHub Actions, but performance was still pretty poor. `pkgs` exceeded the 6-hour GitHub timeout repeatedly and was only able to complete by partial caching between runs.

These dependencies are also missing RISC-V support:
- [ ] [Stable Alpine release](https://gitlab.alpinelinux.org/alpine/aports/-/issues/13269), currently using `edge` in bldr
- [ ] [Free NVIDIA kernel modules](https://github.com/NVIDIA/open-gpu-kernel-modules/pull/152)
- [ ] [Non-free NVIDIA kernel modules](https://download.nvidia.com/XFree86/)
- [ ] [iPXE](https://github.com/ipxe/ipxe/pull/970)
- [ ] [kernel-hardening-checker](https://github.com/a13xp0p0v/kernel-hardening-checker/issues/56)

The Lichee Pi 4 has confirmed Turing Pi 2 support with networking, but no PCIe/SATA. Might be a good option if I can't get an LM3A/5A to test.