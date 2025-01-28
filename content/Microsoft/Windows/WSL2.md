---
dg-publish: true
---
## Firewall (patched)
Uses a Hyper-V switch called WSL, windows firewall blocks traffic to host by default but host is auto-configured as DNS resolver in /etc/resolv.conf!
Can fix with a flag (generateResolvConf? false) in `%userprofile%/.wslconfig`, but better way is an all-allow firewall rule on the adapter:

```powershell
New-NetFirewallRule -DisplayName "WSL" -Direction Inbound -InterfaceAlias "vEthernet (WSL)" -Action Allow
```

Except this doesn't work on machines where local firewall rules aren't processed, per https://github.com/microsoft/WSL/issues/4139#issuecomment-766316939
And GPO GUI can't use interface-based rules. So export from local rule into local GPO (right-click the root node), since there's on rule-specific import/export. Then delete everything except WSL - the MMC is laggy and can softlock.
![[AllowWSL.wfw|AllowWSL.wfw]]

Recommend deploying this alongside WSL distros via Intune. Probably need to enable Hyper-V features too.
[Create Windows Firewall rules in Intune (Windows) - Windows security | Microsoft Docs](https://docs.microsoft.com/en-us/windows/security/threat-protection/windows-firewall/create-windows-firewall-rules-in-intune)

PowerShell script: 
```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
```

possibly via Proactive Remediation, for visibility on users who haven't restarted

## USB devices
Admin required for first mount
```
winget install usbipd
usbipd wsl list
usbipd wsl attach --busid 3-2
```
xfs (Talos) isn't supported 

https://www.xmodulo.com/change-usb-device-permission-linux.html
https://github.com/dorssel/usbipd-win/wiki/WSL-support

```
sudo service udev restart
sudo udevadm control --reload
```

### Audio
```
apt-get install pulseaudio
docker run -t -i -e "PULSE_SERVER=${PULSE_SERVER}" -v /mnt/wslg/:/mnt/wslg/ image_name
```

may need to apt install libasound2-plugins
https://github.com/microsoft/wslg/issues/634

```python
cd /app/config/programs/wake/porcupine1
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
deactivate
cd /app

script/run bin/wake_detect.py --debug

cp .venv /app/config/programs/wake/porcupine1
cp porcupine_linux.ppn.bak config/programs/wake/porcupine1/.venv/lib/python3.9/site-packages/pvporcupine/resources/keyword_files/linux/porcupine_linux.ppn
```

# SSH
Use Windows 24H2 which comes with recent OpenSSH in-box, or install it manually from GitHub. Then enable the ssh-agent service, requires admin unfortunately

Generate
```
ssh-keygen -t ed25519-sk -O resident -O application=ssh:GitSigning -O verify-required
```

Add
```
ssh-add
```

## Shrink disk
```
wsl --manage ubuntu --set-sparse true
optimize-vhd -Path .\ext4.vhdx -Mode full
```

## Kernel
A few years ago, I subscribed to a GitHub issue on [10x-ing 9P filesystem performance](https://github.com/microsoft/WSL/discussions/9412#) in WSL2, in the hope that it'd be fixed soon. This morning I was pinged by another frustrated user still waiting for the fix.
But after my work on [[Talos|Talos]], I'm pretty comfortable maintaining forked kernels. Let's see if I can build a faster kernel with Docker and BuildKit.

