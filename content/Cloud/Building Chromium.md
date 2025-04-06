---
dg-publish: true
---
The source code alone needs ~50GB, so I use GitHub Codespaces with 128GB of storage for short-term contributions. But they only have 100mbps networking so a proper VM might be much faster to setup.
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

For Brave Browser, we can simply sync then run `RBE_service=remote.buildbuddy.io:443 RBE_credentials_helper=$(pwd)/rbe-headers-helper.sh npm run build -- --use_remoteexec`. The script could even be modified to accept args, and use `RBE_credentials_helper_args` to provide the token and/or header.

Unfortunately remote builds fail with a pretty opaque error. Looks like the upload or paths aren't working? Even though `check_reclient_works.py` succeeds.

Full build script
```sh
export RBE_service=remote.buildbuddy.io:443 RBE_credentials_helper=$(pwd)/rbe-headers-helper.sh RBE_log_dir=$(pwd)/rbe
git clone https://github.com/brave/brave-core src/brave
	cd src/brave && npm install && npm run sync
RBE_server_address=127.0.0.1:8000 python3 third_party/reclient_configs/src/check_reclient_works.py --src_dir=..
npm run build -- --use_remoteexec --target=brave/components/policy:pack_policy_templates
```
