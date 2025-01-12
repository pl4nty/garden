---
dg-publish: true
---
## API
The [GitHub API feeds endpoint](https://docs.github.com/en/rest/activity/feeds?apiVersion=2022-11-28) no longer returns private feeds like `current_user_url`, and they're not available in the GitHub homepage either. Possibly because the homepage now uses an internal server-side-rendered API.

## Codespaces
Underlying VMs are missing the `ip6tables` kernel module for docker/kind, so we have to disable in the daemon.

```sh
echo '{"ip6tables": false}' > /etc/docker/daemon.json
ps aux | grep dockerd
root        4585  0.5  1.1 2204448 94952 ?       Sl   14:54   0:26 dockerd --dns 168.63.129.16
codespa+   40662  0.0  0.0   8172  2432 pts/0    R+   16:16   0:00 grep --color=auto dockerd

sudo kill -SIGINT 4585
sudo dockerd --dns 168.63.129.16 &
```

## Actions
New workflows in a feature branch won't trigger for testing because they don't exist on `main`. A stub workflow file on `main` fixes this, particularly for manual triggering with `workflow_dispatch` on the feature branch.
```yaml
name: Feature
on:
  workflow_dispatch:
```
