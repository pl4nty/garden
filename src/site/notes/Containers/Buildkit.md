---
{"dg-publish":true,"permalink":"/containers/buildkit/"}
---

## GitHub Actions
Selfhosted runners like Talos's can mount `buildkitd.toml` in a [service container](https://docs.github.com/en/actions/using-containerized-services/about-service-containers) to enable TCP.

```yml
services:
  buildkitd:
	image: moby/buildkit:v0.13.1
	options: --privileged
	ports:
	  - 1234:1234
	volumes:
	  - /var/lib/buildkit/${{ github.repository }}:/var/lib/buildkit
	  - /usr/etc/buildkit/buildkitd.toml:/etc/buildkit/buildkitd.toml
steps:
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
  with:
	driver: remote
	endpoint: tcp://127.0.0.1:1234
```

But hosted runners can't create `buildkitd.toml` before the `services` stage, and we can't pass `--addr 0.0.0.0:1234` because service containers don't support arguments. We could use `docker-container://` instead, which is more secure since it doesn't expose the BuildKit API to the container build steps eg `RUN`. Service containers have a randomised name suffix, so we'd need to get the container name and pass as an output, and they're also only supported on Windows.

It ends up easier to just

```yml
steps:
- name: Set up BuildKit
  run: docker run -d --name buildkitd --privileged -v /var/lib/buildkit/${{ github.repository }}:/var/lib/buildkit moby/buildkit:v0.13.1
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
  with:
	driver: remote
	endpoint: docker-container://buildkitd
```

