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
Use W
Enable ssh-agent service
Download [npiperelay](https://github.com/jstarks/npiperelay/releases/tag/v0.1.0) and extract to get binary (README is wrong)
Add to windows $HOME\\.wsl\\ (`ln -s ~/winhome /mnt/c/Users/tom`)
```
sudo apt install socat
wget -o ~/.local/bin/wsl-ssh-agent-relay https://raw.githubusercontent.com/rupor-github/wsl-ssh-agent/master/docs/wsl-ssh-agent-relay
chmod +x ~/.local/bin/wsl-ssh-agent-relay
mkdir ${HOME}/.ssh
sudo sh -c 'echo :WSLInterop:M::MZ::/init:PF > /usr/lib/binfmt.d/WSLInterop.conf'
```

add to bashrc
```
${HOME}/.local/bin/wsl-ssh-agent-relay start
export SSH_AUTH_SOCK=${HOME}/.ssh/wsl-ssh-agent.sock
```

firsttime
```
ssh-keygen -t ed25519-sk -O resident -O application=ssh:GitSigning -O verify-required
ssh-add
```

```
SOPS_AGE_KEY=[see bitwarden]
SOPS_AGE_RECIPIENTS=age18k9804sxqzuxn3pka0x6rgdqp0g7gm7w99g4lu43meqkl9s8lvrsl6n0vh

```


this might be a thing? might not work with devcontainers though
`export SSH_SK_HELPER="/mnt/c/Program Files/OpenSSH/ssh-sk-helper.exe"`

## Shrink disk
```
wsl --manage ubuntu --set-sparse true
optimize-vhd -Path .\ext4.vhdx -Mode full
```
