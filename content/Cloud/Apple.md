---
dg-publish: true
---
## FSEvents
FSEvents files are written to disk by macOS APIs and contain historical records of file system activity that occurred for a particular volume. They can be found on devices running macOS and devices that were plugged in to a device running macOS. They are GZIP format, so you can also try carving for GZIPs to find FSEvents files that may be unallocated.

FSEventsParser can be used to parse FSEvents files from the '/.fseventsd/' on a live system or FSEvents files extracted from an image.

[dlcowen/FSEventsParser: Parser for OSX/iOS FSEvents Logs (github.com)](https://github.com/dlcowen/FSEventsParser)

`docker run -it --rm -v ${PWD}:/app -w /app python:2 python FSEParser_V4.0.py -s .fseventsd -o /app -t folder`

## Spotlight
Spotlight (search) stores a file index on disks, including USBs

mac_apt is a DFIR (Digital Forensics and Incident Response) tool to process Mac computer full disk images (or live machines) and extract data/metadata useful for forensic investigation. It is a python based framework, which has plugins to process individual artifacts (such as Safari internet history, Network interfaces, Recently accessed files & volumes, ..)

mac_apt now also includes **[ios_apt](https://swiftforensics.com/2020/12/introducing-iosapt-ios-artifact-parsing.html)**, for processing ios images.

Spotlight files are store.db and .store.db under `Spotlight-V100\Store-V2\<guid>`

Python 3.9 as of writing, and need to copy some dependencies manually (and no requirements.txt). Also needs [[dotfiles|dotfiles]] path length workaround on Windows
`python .\mac_apt_artifact_only.py -l DEBUG -i D:\.Spotlight-V100\Store-V2\7631E1DA-83B1-4AC7-9D70-49CC9335073A\.store.db store.db -c SPOTLIGHT -o .`

So I PRed a Dockerfile: `docker run --rm -v ${PWD}:/data mac_apt mac_apt_artifact_only.py -i /data/.store.db /data/store.db -o /data/MAC_APT_OUT -c SPOTLIGHT`

## IPAs
iOS apps are distributed as `.ipa` files, an archive containing app metadata and contents. They can be encrypted.
[majd/ipatool](https://github.com/majd/ipatool/) uses private APIs to download them with a valid Apple account, but it's not designed for headless use. Apple have pretty aggressive IP tracking and MFA is required for newly-created accounts. They've also blacklisted Docker's MAC address which ipatool was using, and recently disabled the endpoint for purchasing apps. Existing apps can still be downloaded.

Intune's [[iOS|iOS]] DLP uses URL schemes to restrict cross-app data transfer. These are found in `Info.plist` in the `.ipa`, but can be tricky to find and carve out for for admins who aren't familiar with iOS (like this [manual guide](https://c7solutions.com/2021/04/intune-mam-exemptions-discovering-url-protocols)). I wrote a Go web app based on ipatool to automate it and pull some other metadata too: https://ios-app-data.tplant.com.au/
But it's less useful now that purchasing is broken.

iTunes on Windows can still generate the right headers to purchase apps, so [NyaMisty/actions-iTunes-header](https://github.com/NyaMisty/actions-iTunes-header) was built to automate the process with GitHub Actions. I built a [metadata tracker](https://github.com/pl4nty/ipa-track) with it, and it's useful for finding URIs too. ipatool would be faster for download now that its auth is fixed, but the iTunes header approach will probably be more reliable in the long term.

## Config
Ivanti started an old [AppConfig Community](https://www.appconfig.org/) spec for populating [NSUserDefaults](https://developer.apple.com/documentation/foundation/nsuserdefaults) via MDM plists, and Jamf built an [AppConfig Utility](https://beta.appconfig.jamfresearch.com/generator) web app to create/fill compliant schemas. Unfortunately I can't find a way to carve app config from `.ipa` contents, so I'm relying on vendors publishing their schemas at the moment.