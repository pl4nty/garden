---
dg-publish: true
---
Played [[Codegate 2025 Quals|Codegate 2025 Quals]] onsite so I tried out a remote environment, cause my laptop is way too slow for local. Went surprisingly well so I reckon I'll try again for future onsite CTFs.
## VMs
Near the challenge infra vs near me? Some chals are faster or easier to solve with lower latency, but I'll need to see how VSCode remoting and remote GUIs (RDP/X11) perform with medium/high latency.

Went with bare metal rather than my usual devcontainers to avoid any bugs, but that means I need to run my dotfiles manually and install tools from scratch. Debian stable can occasionally break tools too. VSCode SSH remoting performed pretty well, but I need to try [X11 forwarding](https://x410.dev/cookbook/enabling-ssh-x11-forwarding-in-visual-studio-code-for-remote-development/) and figure out something for Windows. Maybe [VSCode Tunnels](https://code.visualstudio.com/docs/remote/tunnels) and RDP? Should also try out VSCode Live Share when some teammates are playing remotely.

Which tools should I preinstall? python, jupyter, pwntools for starters. Lucky I don't do much rev. Maybe the usual steg toolkit too? I should also prep some autosolving scripts/templates in jupyter for low-hanging fruit, and tools like custom webhooks.

Speaking of scripts - something to automate common CTFd actions? A couple common ones
* polling until chals are available at the start
* chal download
* flag submission - pwntools has something?

## Agents
rev, especially labelling [All You Need Is MCP - LLMs Solving a DEF CON CTF Finals Challenge - Wil Gibbs](https://wilgibbs.com/blog/defcon-finals-mcp/). not sure I want to learn IDA though...
angr? maybe pair with good templates for pwn
[DaCodeChick/GhidraMCP: Independent fork of LaurieWired's GhidraMCP for continued development](https://github.com/DaCodeChick/GhidraMCP)
fine-tuned agents? [this one](https://arxiv.org/html/2505.16366v1) was 7B but competitive with SOTA reasoning models. use it as sub-agents on a RunPod or something? with a reasoning agent as the orchestrator
[albertan017/LLM4Decompile: Reverse Engineering: Decompiling Binary Code with Large Language Models](https://github.com/albertan017/LLM4Decompile)
[D-LiFT: Improving LLM-based Decompiler Backend via Code Quality-driven Fine-tuning](https://arxiv.org/html/2506.10125v1)