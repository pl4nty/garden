---
dg-publish: true
---
The only public installer (https://links.fortinet.com/forticlient/win/vpnagent) is an interactive-only stub that downloads an exe with silent args, so I thought I'd rev the download process to get the silent installer. But it's very cooked. I guess they reused the firmware update protocol from their appliances???

At least the silent installer is simple, the MSI it uses is just a PE resource.

```yml
meta:
  id: forticlient
  title: FortiClientVPN.exe, not the stub
  imports:
    - microsoft_pe
    - microsoft_cfb

seq:
  - id: pe
    type: microsoft_pe

instances:
  data:
    value: pe.pe.sections[3].resource_table.id_entries[4].subdirectory.named_entries[1].subdirectory.id_entries[0].data_entry

  msi:
    type: microsoft_cfb
    pos: (data.data_rva - data._parent.section_virtual_address) + data._parent.section_file_offset
    size: data.len_resource_data_entry
```

I couldn't find any references online besides a [license generator](https://github.com/rrrrrrri/fgt-gadgets/blob/main/license_gadget/base%20license/old/fds_server.py), but I eventually reversed the full protocol. Some parts could be considered vulnerabilities though, so I won't release it publicly. Email me if you're interested.

[Breaking Fortinet Firmware Encryption | Bishop Fox](https://bishopfox.com/blog/breaking-fortinet-firmware-encryption)