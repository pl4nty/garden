---
dg-publish: true
modified: 2023-12-30
---
Building Australia's Largest* Highschool CTF
\*probably

After a few years of working on the PECAN+ cybersecurity event, it's about time I did a writeup. No challenge solutions though - you'll have to wait for PECAN+ 2024!

# Introduction
PECAN+ started as a cyber training weekend for high-school students, run by Edith Cowan University and the Australian National University. Over time it evolved into a training day and fully-fledged Capture The Flag (CTF) competition with around 500 students from across the country. I've been working on the tech stack for a few years, and faced some pretty unique challenges along the way.

PECAN+ was pretty lean from the start. We can't rely on experienced challenge authors or a large infrastructure team - almost all our authors are new to writing CTF challenges or CTFs in general, and the infra team is just me. So I focused on ease of use and automation to save as much time as possible. Here's a rough architecture diagram:

TODO
# Scoreboard
CTF scoreboard (or framework?) software doesn't just track teams and points, it's also the interface for challenges, and can have a huge impact on how a CTF plays out. The de-facto standard is [CTFd](https://github.com/ctfd/ctfd), but it had limited automation support in 2021 so I deployed [rCTF](https://github.com/redpwn/rctf) on Azure ([here's the template](https://github.com/ECUComputingAndSecurity/PeCanCTF-2022-Public/tree/main/infra/rctf)). It was great - fast (loadtested at 10k RPS), valuable features like scoreboard categories, and very easy to deploy. Unfortunately it was abandoned soon after and was pretty broken by 2023. In the meantime, CTFd had beefed up their automation tooling, and offered paid hosting to avoid worrying about it's [well-known](https://youtu.be/fGxy-O39dYA) [performance](https://medium.com/@iamalsaher/the-admin-side-of-evlzctf-2019-ccb77d45c74d#:~:text=We%20can%20see%20the%20workers%20just%20timing%20out%20and%20rebooting%20and%20WE%20HAD%20NO%20EXPLANATION%20WHY.) [issues](https://medium.com/@sam.calamos/how-to-run-a-ctf-that-survives-the-first-5-minutes-fded87d26d53#:~:text=We%20%E2%80%9Cfixed%E2%80%9D%20this%20through%203%20techniques). The transition went pretty smoothly, and we intend to stick with it next year, but there are a few downsides:
* US hosting causing poor latency to Australia. Also affected downloads, with a Cloudfront CDN that needed manual cache warming
* Managed by a third party, who took down our instance for maintenance shortly before the CTF  (but quickly fixed it)
* Challenge hosting limits - capped number of chals and CPU/RAM, basic networking, and unscalable multi-container challenges
* Plugins behind an expensive tier

It also doesn't natively support different scoreboards for team divisions (eg beginner, intermediate, advanced). There's a [plugin](https://github.com/durkinza/CTFd_Split_Scoreboard)but I ran out of time to update for the latest CTFd version, so I wrote a script to parse division winners from a scoreboard export:
```powershell
$scores = Import-Csv '.\PECAN+ CTF-scoreboard.csv' | select @{n='score2';e={[int]$_.score}},* | sort score2 -Descending
$scores | where "All Female Team" -eq $true | select -First 1 "user name", score2
$scores | where "Indigenous or Torres Strait Islander team member(s)" -eq $true | select -First 1 "user name", score2
$scores | where Division -ceq "beginner" | select -First 4 "user name", score2
$scores | where Division -ceq "intermediate" | select -First 4 "user name", score2
$scores | where Division -ceq "advanced" | select -First 4 "user name", score2
```
# Challenges
We had a few communication channels to cover a wide audience (Discord, email, etc), but we centralised challenge development on a GitHub monorepo. This ensures everyone can access challenge content and writeups, along with providing pre-configured development environments via [GitHub Codespaces](https://github.com/features/codespaces). It was also easy to automate challenge deployment using [GitHub Actions](https://github.com/features/actions), at first to [Azure Kubernetes](https://azure.microsoft.com/en-au/products/kubernetes-service) with [rCDS](https://github.com/redpwn/rcds) and later to CTFd hosting with [ctfcli](https://github.com/CTFd/ctfcli). Kubernetes was complex to setup but pretty bulletproof with a combination of [AGIC](https://learn.microsoft.com/en-us/azure/application-gateway/ingress-controller-overview) for web chals and a layer 4 loadbalancer for pwnables. CTFd was simple but much less flexible, and we had to reject at least one challenge. I ended up writing a [Kubernetes ctfcli plugin](https://github.com/pl4nty/ctfcli-deploy-kubernetes) shortly after the CTF - maybe we'll use it next year.

Testing and quality control has always been difficult for PECAN+, sometimes more than the actual challenges! The monorepo provides helped with visibility and keeping authors accountable (submitting a few hours before the CTF isn't ok 😅), and testing will be a major goal next year. Hopefully I'll integrate it with pull requests in my [CTFd automation template](https://github.com/pl4nty/auto-ctfd), which automates formatting, testing, peer review, and deployment.

# Environment
Solving CTF challenges often requires niche tools that are difficult to install and configure, especially for first-time competitors. It's particularly difficult for students, who might be unwilling (or unable) to install "hacking" tools on their school laptops. PECAN+ competitors were also competing from university campuses and networks that might not appreciate suspicious traffic. We needed to provide easy access to the necessary tools with minimal impact on student devices or networks.

I've previously worked on cybersecurity training environments ("cyber ranges"), but the popular options (eg Skillable, bespoke vRO/vRA) were often designed for long-term training programs with a steep learning curve. We settled on Azure Lab Services, which provides on-demand virtual machines (VMs) via RDP or SSH. Microsoft's team were really helpful and made sure onboarding went smoothly. We could scale up to hundreds of VMs automatically or shut down unused VMs to reduce costs. It worked pretty well, as long as the custom RDP and SSH port ranges were approved *in advance* by university network teams... Causing some last-minute headaches in 2022. More on that later.

Kali Linux (despite the stereotypes) was an easy pick for the VM image - it had most of the tools we needed with minimal configuration. I patched the [build scripts](https://gitlab.com/kalilinux/build-scripts/kali-cloud) to support Azure and [built with WSL](https://github.com/ECUComputingAndSecurity/PeCanCTF-2022-Public/blob/main/infra/README.md). The build was slow and [disk-destroying](https://github.com/microsoft/WSL/issues/4699) but enough for PECAN+ 2022.

By the time 2023 rolled around, an official Kali Azure image had released, but the image license broke with Lab Services so I was stuck with the build scripts. This time I wanted something quick and repeatable in case I needed to fix bugs at short notice. Turns out Kali upstream (Debian Salsa) were using self-hosted GitLab Runners for automated image building, so I spun up a [Kubernetes executor](https://docs.gitlab.com/runner/executors/kubernetes.html) on my [homelab](https://github.com/pl4nty/homelab/blob/main/kubernetes/oke/gitlab-runner.yaml) and got building. I also wrote a [script]() TODO to automate some post-build customisations:
* Lab Services agent bugfixes
* Pin to last-snapshot sources - somehow this isn't the default on a last-snapshot image
* Install tools eg kali-linux-default
* xRDP and performance tuning
* Blank wallpaper and new tab page - this ended up being manual via Lab Services' snapshot process

Most students weren't comfortable with SSH so xRDP was critical, but tuning it was a rabbit hole. [TCP buffers were tiny](https://github.com/neutrinolabs/xrdp/issues/1483),  [Win11 removed a faster protocol](https://github.com/neutrinolabs/xrdp/issues/2400), and we had a whole classroom of [p2p Ubuntu desktops](https://gnosia.anu.edu.au/wiki/Lab_Machine_(CSTS)) using [Remina](https://remmina.org/) with slow default settings. Sometimes the solution is just logging into each desktop and changing the settings 🙃

Besides performance, we also had to grant access with unique and secure accounts - some students were keen to pwn each other rather than the challenges. I used a quick script to generate accounts and distributed the credentials in a CSV. I also [patched our 2022 scoreboard](https://github.com/ECUComputingAndSecurity/rctf) to use these accounts, but that was too complex in hindsight.

```powershell
Import-Module Passphraser
$accounts = @()
0..599 | % {
	$_ = '{0:d3}' -f $_
	$passphrase = New-Passphrase -Separator "-" -AmountOfWords 2
	$account = @{
		$upn = "player$_@ctf.ecusri.org"
		$username = "Player $_"
		$password = $passphrase.Substring(0,1).ToUpper()+$passphrase.Substring(1)+"1"
	}
	$accounts += $account
	
	az ad user create --user-principal-name $account.upn --display-name $account.username --password $account.password 
}
$accounts | Export-Csv
```

Next year, we're planning to try [Kasm Workspaces](https://kasmweb.com/) for its one-click access and web-based interface. It's also a fair bit faster than RDP. I had a crack at [WASM-powered Kali](https://pl4nty.github.io/webvm/) but it's not quite ready yet...

# Operations
I felt well-prepared but something always goes wrong. Discord was invaluable for quick issue triage/repro, especially with broken challenges or flaky infrastructure. There's still a lot we can improve on though:
* Rigorous challenge testing - several challenges had flag typos or missing files, let alone perf or flag-overwrite exploits
* Infrastructure monitoring - CTFd and Lab Services are pretty opaque by default
* Triage and comms - issue statuses need to be clear and actionable, especially for non-technical volunteers

These will be the main infra focus for 2024.

# Conclusion
Thanks for making it this far! If you're interested in supporting a CTF with incredible real-world impact, hit me up - PECAN+ 2024 is going to be bigger and better than ever. If you're running a CTF, I've love if you checked out my [CTFd automation template](https://github.com/pl4nty/auto-ctfd) and let me know what you think. I also want to thank [Michelle Ellis](https://au.linkedin.com/in/dr-michelle-ellis-4bb72493) and [Paul Haskell-Dowland](https://au.linkedin.com/in/pdowland) for their passion and vision to build PECAN+ over the years, and grow it into such a success.

That's all I've got for now, see you in 2024 😊

## Postmortem
### ANU
RDP client resolution negotiation is flaky, dynamic res causes significant slowdowns
Give more time for logins
For the most part, students can just use their Linux Mint hosts

## Presenters
Interactive presentations could be streamlined if we knew what they wanted. They should also be tested just in case they break with Kali
* Cheat sheets
* External resources eg OverTheWire
* Forensics presenter at ANU wanted additional files, comms confusion between onsite staff and infra team
* VMs were heavily used, so we can't preload challenge resources
* Non-interactive sessions (lecturers like Alexei) struggled, lots of students distracted by computers
* Feedback from presenters, authors, and volunteers
* Break up non-interactive with interactive? But don't want them distracted

## Tech
Late password change wasn't received by everyone
Monitoring on logins? Shutting down only saves ~200USD/day though. and last login time looks like it requires licensing
Dropdown for division selection (beginner, intermediate, advanced). Some users were doing beginner/intermediate in one string
Division scoreboards

Bris/Cbr/Hobart/Adelaide/perth have authed

melb 300-399
wollon 530-580
1 from perth

if your team has made more than 1 account, just pick an account for everyone to use. you can rename it if needed



Over the last year, I've built the platform that powered [PeCan+ 2022 CTF](https://pecanplus.cyberedu.space/). This blog series aims to cover the design decisions and technical implementation that led to a successful CTF - and hopefully help other CTF organisers along the way.

  

## Background

  

PeCan+ is an annual two-day event established by Edith Cowan University (ECU, in Perth) and the Australian National University (ANU, in Canberra). It's designed to introduce high-school students to a broad range of cybersecurity topics, and traditionally runs onsite at university campuses over a weekend in September. Saturday is a training day, with presentations and workshops from academics, university students, and industry representatives. Sunday is reserved for a Capture The Flag (CTF) event to focus on practical cyber skills.

PeCan+2021 hybrid, focus on ctf, kali labs, CTFd vs rCTF

---

title: "Building a CTF Part 4: Results and Future"

date: 2022-09-18

draft: true

tags: [

    "CTF"

]

---

  

Testing, labs, rCTF, writeups/feedback

Testing/healthchecks, web-based labs, hosted CTFd

  

Presenters

Tas - Very happy, good presenters

Adelaide - very happy, good difficulty level

Perth - kids were pretty tired, lots of info

  

Date

Tas - running on open day

Perth - clash with Cyber Taipan

Line up with midsem break for authors

  

Users/logistics

Tas - 3 teams, including Year 8s

Adelaide - groups of 2

Perth - single student played

Canberra - facilities were great, 1 solo student joined another team

Canberra - teachers loved it, anecdote of 1 student who loved it. Public/private mixed well, good atmosphere.

  

Challenges

Tas - Canva one, probs "how random"

Tas - Some beginners ran out of challenges mid-afternoon

Adelaide - the OSINT one, needs more testing. Good to have an onsite rep who's solved some.

UC - research students were more mature authors and better chals

  

Presentation

Cut over to other sites for prizes

Getting kids to stand up was hard

Some kids left in the half hour, incl the ones who ran out of chals. Around 4pm Tas time

live 'order of proceedings' for the awards ceremony, and also a powerpoint with the winners

so there is a visual acknowledgement of the team name and also the state :)

Cbr - certificate of participation, signed by AustCyber

  

Cost

Tom - $860 for VMs + infra

Canberra - $2.5k for shirts, $1.4 for snacks etc

  

Writeups etc

Adelaide - student keen for infra writeup to run a CTF for highschool

Tas - comp for uni students

  

Next year

Adelaide - keen. Deloitte, DSTG, etc

Kids keen to write chals and do presentations

  

Tech

Adelaide - groups of 4 was tricky. Need to allocate more time for setup

Perth - delays with VMs

Tas - lab machines were on guest wifi, so laptops were ok. OVA for students to use

Jan GPN event reusing infra
## Writeups
* Anything by Canva
* Turbo Penguin Chris Fitzsimmons forensics, AD is fine


## Changes
wkwkwk case insensitive
active directory 6 dash not underscore
twitter chal pecan{matagarup_bridge} not pecan{metagarup_bridge}
lesson learnt 2 pecan{plumridge_lakes} flags not flag
pickle-me-this 2 flag

##
VM resource issues when launching neo4j and ghidra?


@everyone Thanks for playing, we hope you enjoyed the CTF! Congratulations to our prize-winners:

Beginner Division
1st: PamPam (ACT) 8272
2nd: We haven't decided yet (ACT) 7920
3rd: Royal Tornado 4: A New Winston (ACT) 7030
4th: CryptoPOGraphers (SA) 6304

Intermediate Division
1st: Senior Prompt Engineers (SA) 8968
2nd: Dingoes (WA) 7874
3rd: ChatGPT (WA) 7620
4th: Chris and her sons (WA) 6860

Advanced Division
1st: Emu Exploit (WA) 13388
2nd: Obsidian'); DROP TABLE Participants; -- (WA)
3rd: TH3 PL3B5 (QLD) 5970
4th: WLTG (ACT) 3086

First team to solve the ASD challenge, Spilled Secrets
JBBS (ACT) 4750

Highest-scoring all-female team
Team_Burgers (ACT) 5462

Highest-scoring team with an Indigenous competitor
whodeannie10 (WA) 732

state should've been uni

firefox auto refresh extension

webhooks down
forgot to release survey

