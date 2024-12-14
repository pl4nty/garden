---
dg-publish: true
---
Google Japan build fun input devices for April Fools, and a lot of the build files (schematics/firmware) are on [GitHub](https://github.com/google/mozc-devices). I wanted to try building some myself, but first I had to calculate costs.

Prices are in USD without shipping unless otherwise specified. I used JLC's docs for production files if they weren't already available.
* [How to generate Gerber and Drill files in KiCAD 8? (jlcpcb.com)](https://jlcpcb.com/help/article/how-to-generate-gerber-and-drill-files-in-kicad-8)
* [How to generate BOM and Centroid files from KiCAD 8? (jlcpcb.com)](https://jlcpcb.com/help/article/how-to-generate-bom-and-centroid-files-from-kicad-8)
## Mobius strip ("doublesided")

| Item                                                       | Quantity                    | Price                                      |
| ---------------------------------------------------------- | --------------------------- | ------------------------------------------ |
| Assembled A Type Board                                     | 26 boards (incl. 1 primary) | $188.22 for 45 + Kailh sockets and primary |
| Assembled B Type Board                                     | 26 boards (incl. 1 primary) |                                            |
| USB Board                                                  | 1 board                     |                                            |
| Cable A; JST ZH 1.5mm pitch 8pin 100mm forward double head | 25 units                    |                                            |
| Cable B; JST ZH 1.5mm pitch 7pin 100mm forward double head | 1 unit                      |                                            |
| Pin Header; 1x4 pin 2.54mm pitch 12+mm height (sample)     | 52 headers                  |                                            |
| 3D printed case                                            | 26 pcs                      | $35.67 + $23.81 shipping with 9600 resin   |
| Self tapping screw (M2 10mm)                               | 52 pcs                      |                                            |
| Key switch (Cherry MX or compatible)                       | 208 pcs                     | ~$50                                       |
| Key caps (For Cherry MX switch)                            | 208 pcs                     |                                            |
Probably over 300USD total, too expensive :(
## cup ("yunomi")

| Item                          | Quantity | Price                 |
| ----------------------------- | -------- | --------------------- |
| Pro Micro base board          | 1        | $2 for 5              |
| Key (side) board              | 12       | $5.70 for 15          |
| 3D printed case               | 1        | $0.30                 |
| 3D printed jig (optional)     | 2        | $0.60                 |
| 1N4148 diode                  | 60       | $1.94 for 100         |
| Pro Micro                     | 1        | from spares           |
| Right-angle header (optional) | 24       | $2.37 for 400         |
| Single-core wire              |          | $1.67                 |
| Choc switch                   | 60       | $27.68 for 70         |
| Choc keycaps                  | 60       | $38.16                |
| Cup                           | 1        | $9.80                 |
| **Total**                     |          | **$90.22 + shipping** |

Gerbers for standard base, Pro Micro base, and key (sides)
![[gerber.zip|gerber.zip]]

[Partial guide](https://hfchang.net/gboard_soup_version_key_edition/)

I used the Pro Micro base because I have spares. JLC only had red switches in stock (no linears in my tactile factory pls), so PCBA wasn't worth it for either PCB.

Bought the remaining components from Aliexpress. Went with Kailh burnt orange switches, they're a heavier tactile than browns. Better options weren't available - the sunset tactile and and unreleased sunrise silent tactile are apparently great. Should be on Australian https://keebd.com soon.

Used CFX BoW en/jp caps because the nice Google ones must've been hand-painted.

It was tricky to find a suitable cup (50x100mm), I ended up with a [48x65 tapered ceramic](https://www.aliexpress.com/item/1005003221031752.html?spm=a2g0o.order_list.order_list_main.5.64f41802jTq6Yj) because most steel/glass were too wide.

Maybe the base could have extra sides? I had 3 spares. Only had 8 spare keycaps though on an alpha set, and extras cost more than alphas.

The short edge of the base is a great jig for bending diodes
Link to readme, it's pretty good

#TODO better 3d-printed case, Google one isn't fully released

#TODO photos and firmware

Use solder instead of wire for joins
Compile with Arduino IDE to Leonardo target

[Abandoned QMK port](https://github.com/qmk/qmk_firmware/pull/15119)
Ported Pro Micro QWERTY layout to Vial
ui3cp\p3c3c3c