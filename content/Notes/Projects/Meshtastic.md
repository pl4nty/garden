---
dg-publish: true
---
Community-run LoRA mesh network, at least three nodes in Canberra and more during BSides.

Entrypoints
* Heltec v3: ESP32 all-in-one, even has case. antenna needs replacing though. ordered from Ali
* RAK Wisblock: low-power for battery/solar, more DIY/expensive, several pieces and needs a case eg printed

[The Next Level – Meshtastic Australia](https://meshtastic.au/wp/?page_id=52)

[Getting started with Meshtastic - Liam Cottle's Blog](https://blog.liamcottle.com/2024/05/01/getting-started-with-meshtastic)

[MeshHackers](https://www.meshhackers.com/)

## Heltec v3 setup
The case comes closed, but it's easiest to open from the tail with a shim or screwdriver.
The supplied antenna isn't great so I installed a RAK one. If I had a drill, I reckon it could be mounted in the tail, but for now I'm routing the connector through the hole under the USB-C port. Don't want to get in the way of headers too much.

Flashing needs a driver. I used the Universal Windows Driver from [CP210x USB to UART Bridge VCP Drivers - Silicon Labs](https://www.silabs.com/developer-tools/usb-to-uart-bridge-vcp-drivers?tab=downloads), and installed it manually via Device Manager. Find the faulty device under "Other devices" > right click > Update driver > Browse computer > Open the extracted zip. Then go to https://flasher.meshtastic.org/.

