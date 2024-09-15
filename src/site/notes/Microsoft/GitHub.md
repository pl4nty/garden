---
{"dg-publish":true,"permalink":"/microsoft/git-hub/","updated":"2024-09-15T13:35:35.277+10:00"}
---

The [GitHub API feeds endpoint](https://docs.github.com/en/rest/activity/feeds?apiVersion=2022-11-28) no longer returns private feeds like `current_user_url`, and they're not available in the GitHub homepage either. Possibly because the homepage now uses an internal server-side rendered API.

## Codespaces
Missing the `ip6tables` kernel module for docker/kind, so we disable in the daemon:

```sh
echo '{"ip6tables": false}' > /etc/docker/daemon.json
ps aux | grep dockerd
root        4585  0.5  1.1 2204448 94952 ?       Sl   14:54   0:26 dockerd --dns 168.63.129.16
codespa+   40662  0.0  0.0   8172  2432 pts/0    R+   16:16   0:00 grep --color=auto dockerd

sudo kill -SIGINT 4585
sudo dockerd --dns 168.63.129.16 &
```
