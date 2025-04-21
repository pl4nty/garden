---
dg-publish: true
---
Building Chromium-based projects has been a bit of an adventure. Saner devs would just spin up a beefy VM, but I thought there must be a more efficient way. For what it's worth - I eventually used a VM at least once.

The Chromium source code alone needs ~50GB of disk, so I tried GitHub Codespaces with 128GB of cheap storage for short-term contributions. But they only have 100mbps networking so the clone took ages...
For builds, BuildBuddy has a great free tier and supports Bazel's RBE, but not reclient directly. And it uses a custom HTTP header for auth. Not sure why they didn't use `Authorization`, so we have to get creative.

reclient added support for custom credential handlers recently, with custom headers, so we can write a simple shell script. The token is required even if we don't use it, or set `RBE_service_no_auth`.
```sh
#!/bin/bash

cat << 'EOF'
{
  "headers": {
    "x-buildbuddy-api-key": "<key>"
  },
  "token": "dummy"
}
EOF
```

Then we can set `RBE_service=remote.buildbuddy.io:443 RBE_credentials_helper=$(pwd)/rbe-headers-helper.sh`, sync, and build. The script could even be modified to accept args, and use `RBE_credentials_helper_args` to provide the token and/or header.

For Brave Browser, I used ` npm run build -- --use_remoteexec`, but unfortunately remote builds fail with a pretty opaque error. Maybe the uploads are failing, or using a different path? Even though `check_reclient_works.py` succeeds. reclient [doesn't support BEP yet](https://github.com/ola-rozenfeld/reclient/tree/bep) so I couldn't see much service-side, and I gave up debugging for a bit. Leave a comment if you have an idea I could try.
```sh
 stderr: {"msg":"executable file `../../third_party/llvm-build/Release+Asserts/bin/clang++` not found in $PATH: No such file or directory","level":"error","time":"2025-04-06T00:37:33.846872Z"}
W0406 00:37:34.198999   15410 action.go:448] 369dc557-6d6f-4d2e-b392-765342bbc218: Remote execution failed with &{ExitCode:1 Status:NonZeroExitResultStatus Err:<nil>}, Waiting for local.
```

Full build script
```sh
export RBE_service=remote.buildbuddy.io:443 RBE_credentials_helper=$(pwd)/rbe-headers-helper.sh RBE_log_dir=$(pwd)/rbe RBE_v=2
git clone https://github.com/brave/brave-core src/brave
cd src/brave && npm install && npm run sync
RBE_server_address=127.0.0.1:8000 python3 third_party/reclient_configs/src/check_reclient_works.py --src_dir=..
npm run build -- --use_remoteexec
```

One of the BuildBuddy engineers kindly [replied on Github](https://github.com/buildbuddy-io/buildbuddy/issues/6134) so I had another attempt, but with no luck again. I went back to building on a VM :(
Later on I joined their Slack, and learned I could just `RBE_remote_headers=x-buildbuddy-api-key=mykey` instead of the fancy script...

I sent my PR to Brave and took a break from Chromium experiments until the next weekend, when I stumbled across [NativeLink's](https://nativelink.com/) new (and free) RBE preview. Surely it'll work out-of-the-box, right?
They had a pretty great UX with mTLS and reclient envvars ready to copy/paste. I took way too long to notice a sneaky `RBE_exec_strategy=local` - it was just caching, no execution!

Their RBE was very new and didn't have reclient config yet, but I fixed the strategy and `RBE_remote_headers`. Unfortunately the web UI was providing a hostname with an untrusted cert.

![[Pasted image 20250418224529.png|Pasted image 20250418224529.png]]

I pinged them on GitHub and got the correct hostname soon after, so I tried again the next day. Success! At least for the first ~30k steps, after that it stopped executing jobs. I suspect I just blew through their free tier. Either way, it saved me hours of compile time.
```
/workspaces/brave-browser/src
> autoninja -C /workspaces/brave-browser/src/out/Component brave -k 1
Proxy started successfully.
Streaming build results to: https://bes-pl4nty-ec2b8x.build-faster.nativelink.net:443/invocation/4a7d71a9-349d-4719-b612-7cc0fc9d5952
ninja: Entering directory `/workspaces/brave-browser/src/out/Component'
[43/51617] CC obj/third_party/libjpeg_turbo/libjpeg12/jccoefct.o
```

The events took a full day to show up in app.nativelink.com, but I'll chalk that up to preview or my dodgy reclient fork. More on that below... In any case, I could just [send the events to BuildBuddy instead](https://app.buildbuddy.io/invocation/de899c43-0c0c-415b-8f82-cde0ec1476d5).

![[Pasted image 20250421132149.png|Pasted image 20250421132149.png]]
### Revisiting the Build Event Protocol (BEP)
At this point I'd spent a fair bit of time reading reclient code, and both BuildBuddy and NativeLink were showing off fancy BEP features. Surely I could do a quick rebase of Ola's branches to try it out?

![[Pasted image 20250418230002.png|Pasted image 20250418230002.png]]

That was easier said than done, and I managed to build a segfaulting `scandeps_server` somehow. But `bootstrap` and `reproxy` work so I tried them out with `RBE_bes_service=remote.buildbuddy.io:443`.
* [Rebased remote-apis-sdks b8b282b](https://github.com/pl4nty/remote-apis-sdks/commit/b8b282b7dea208eb5c5d9088ab1ee296163d9685), then [4bc1d5b with my changes](https://github.com/pl4nty/remote-apis-sdks/commit/4bc1d5b7a570783b86143e2b25b04a45fc31a592)
* [Rebased reclient 1dab779](https://github.com/pl4nty/reclient/commit/1dab779cfb715eaa1131c3aa3bc213954febd1cd), then [3546233 with my changes](https://github.com/pl4nty/reclient/commit/3546233c4ea493a6e267213743acdfae9bcc00cf)

Success! Shame Brave still won't build, but I noticed a new [request for BEP](https://github.com/bazelbuild/reclient/issues/141) so I might try upstreaming the patches. Plenty of bugs and hacks to fix first though, like `reproxy` failing to exit.
[bootstrap.zip](https://github.com/user-attachments/files/19813099/bootstrap.zip)
[reproxy.zip](https://github.com/user-attachments/files/19813098/reproxy.zip)
```
I0418 13:25:28.592894  142102 bootstrap.go:79] Sending a shutdown request to reproxy
W0418 13:26:28.593439  142102 bootstrap.go:119] Reproxy Shutdown() returned error. This may be caused by it closing connections before responding to Shutdown: rpc error: code = DeadlineExceeded desc = context deadline exceeded
W0418 13:26:28.593499  142102 main.go:162] Error shutting down reproxy: Reproxy process 139416 still running after 60 seconds. Check the logs and/or consider increasing the timeout: context deadline exceeded
```

![[Pasted image 20250418222557.png|Pasted image 20250418222557.png]]

### Shiny new siso?
Someone mentioned on the reclient BEP issue that [siso](https://chromium.googlesource.com/infra/infra/+/refs/heads/main/go/src/infra/build/siso/)'s native RBE support will replace reclient eventually. So let's try it out. I pulled`SISO_REAPI_ADDRESS` and `SISO_CREDENTIAL_HELPER` from `main.go` to get started. I'd almost deleted that helper script after swapping to`RBE_remote_headers`, lucky I kept it.

`src/brave/build/commands/lib/gnCheck.js` was handy for running `gn clean` to swap from ninja to siso. Brave had also hardcoded `use_siso=false` in a few places, and I found out why pretty quickly. 
```
ERROR at //build/config/clang/clang.gni:60:5: Assertion failed.
    assert(!use_siso, "Can't use non-default rbe_exec_root with siso.")
```

They set `rbe_exec_root` so they can have a top-level `src` directory, but siso doesn't like that.
```
if (this.useRemoteExec) {
    args.rbe_exec_root = this.rbeExecRoot
    args.reclient_bin_dir = path.join(this.nativeRedirectCCDir)
}
```

And removing it doesn't help.
```
W0419 01:55:38.455284   29246 action.go:449] ef748987-0392-4788-948f-c2d9a3def5e8: Remote execution failed with &{ExitCode:35 Status:LocalErrorResultStatus Err:path /workspaces/brave-browser is not under /workspaces/brave-browser/src}, Waiting for local.
```

I couldn't get siso's web UI (http://localhost:36423/) to load either, just kept hitting 404s.
