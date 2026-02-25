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

## AD
Tulip MCP from ICC discord?
https://github.com/FCSC-FR/shovel. doesn't use go


## Dingo



| Description                                                | Service                                                                                                                             |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Messaging, persistence via KV                              | https://github.com/nats-io/k8s                                                                                                      |
| Debugging JetStream                                        | https://github.com/nats-nui/nui                                                                                                     |
| Speed up builds, shared cache                              | https://github.com/moby/buildkit/tree/master/examples/kubernetes#statefulset                                                        |
| Exploit images                                             | https://hub.docker.com/_/registry                                                                                                   |
| Expose frontend, API, registry (with https), builder       | https://tailscale.com/kb/1236/kubernetes-operator#setup                                                                             |
| Dashboards, logging, traces                                | LGTM stack - local or cloud?                                                                                                        |
| Tracing                                                    | https://opentelemetry.io/docs/platforms/kubernetes/operator/automatic/                                                              |
| Connect nodes to gamenet                                   | Wireguard host container + routes                                                                                                   |
| Exploits                                                   | Local container pushed to registry                                                                                                  |
| Create/run exploits, logs, tui?                            | golang cli. require git?                                                                                                            |
| Reconcile exploit deployments, schedule runs, submit flags | backend - python monolith https://github.com/fastapi/fastapi/issues/1173<br>for live edits - need reload + backup/restore to volume |
| Edit exploits, view status/stats                           | frontend                                                                                                                            |
| exploit NATS consumer                                      | golang binary, convert NATS message to envvars and run                                                                              |

| Description                 | Service                           |
| --------------------------- | --------------------------------- |
| Mock gameserver and service | golang, ICC 2025 sample           |
| k8s                         | k3s or Talos?                     |
| Compute                     | Local VMs eg Hetzner              |
| CI                          | GitHub Actions + ghcr + webhooks? |
| e2e tests                   | @helm/kind-action or namespace.so |

## CLI
Dependencies: docker buildx
No `init`, just envvar for server with default. discord username too?
`[exploit]` detects cwd

`create [service] [template]`
Scaffold an exploit for a service using a template. Folder named service-n starting from 1

`run [exploit] [name(s), ip:port(s), or ALL, defaults to NPC/NOP] [--skip-build] -- [exploit args]`
Build with buildkit remote (setup if doesn't exist), run exploit locally, submits flags if found

`push [exploit]`
Rename folder/cd, create exploit on server, build/push image

`logs [exploit] [tick][-endtick]`
Query Loki. Latest tick by default
Status is success/fail. Optional tick/tick-range
## API
CRUD exploit objects
Targets array
Container image
5 rounds of results?

player test loop -> create/push -> deployment -> send on schedule

exploit message -> run against target(s) -> dump flags to stdout+queue

queued submission with batching

## Gameservers
Flag regex
Get teams
Get services
Get targets, flag IDs
Submit flags

enable/disable exploits per team
disabled for all teams on push. flag to enable on team(s)/all
shell completion for teams/services? 
see results of exploit for last 5 ticks
link to exploit logs in grafana
link to pcaps? 
grafana dashboard for stats - exploits, flags
commented segments in templates for common exploits
exploits listen on nodeport eg xss? template
start with base template, pivot if you need xss etc. wasn't possible in Japan... optional or always? 

exploit/patch lifecycle - if we have one, can llm create the other? handoff to other players. takes the fun out of it... 


@Ahmad Aoun good finds, thanks mate. which exe did you use? most exes should have data filled, but some won't if they use old or custom installers. like 7zip (custom installer) or orca (framework from like 15 years ago) 

some would consider it a sin to watch on a plane

apparently great in imax

I couldnt figure out what went on these field
then I remembered we're farming heatwave

lots would be for grazing rather than cropping tho
it's ok



plain rice
butter chicken
cheese garlic naan
egg chowmein


drinks with cal at bsides


linder St? starts with l, good italian

phreaky
call number, use dtmf