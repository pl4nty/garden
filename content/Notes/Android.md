---
dg-publish: true
---
## Patching with Revanced
I end up using Linkedin on Android occasionally for work. The only think I dislike more than its unhinged slop posts, is the incessant ads.
Thought I'd try patching them out with [Revanced](https://revanced.app/) as an excuse to learn a bit of real-world Android rev. 

The Revanced docs are great, I scaffolded a new patch pretty quickly. Only headache was [[GitHub|GitHub]] packages requiring auth for a Maven repo. They really need to support anonymous access, I've had the same issues with their NuGet repos.

Probably should've started with decomp though, that's the hard part. [skylot/jadx](https://github.com/skylot/jadx) did pretty well and even has a nice GUI.
But... I couldn't find a good flag/function to overwrite. And I don't want to risk getting my account banned from dynamic analysis.
Probably a skill issue but I learnt a bit on the way, and I'll send a PR to get jadx added to [[Winget|Winget]].

![[Pasted image 20250525125609.png|Pasted image 20250525125609.png]]