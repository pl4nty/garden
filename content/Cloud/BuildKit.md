---
dg-publish: true
---
## GitHub Actions

Selfhosted runners like Talos's can mount `buildkitd.toml` in a [service container](https://docs.github.com/en/actions/using-containerized-services/about-service-containers) to enable TCP.

```yaml
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

But GitHub-hosted runners can't run scripts to create `buildkitd.toml` before the `services` stage, and we can't pass `--addr 0.0.0.0:1234` because service containers don't support arguments.

We could use `docker-container://<name>` instead of the port, which is more secure since it doesn't expose the BuildKit API to the container build steps like `RUN`. Service containers have a randomised name suffix, so we'd need to get the container name and pass as an output, and they're also only supported on Linux. It ends up easier to just create the container via CLI.

```yaml
steps:
- name: Set up BuildKit
  run: docker run -d --name buildkitd --privileged -v /var/lib/buildkit/${{ github.repository }}:/var/lib/buildkit moby/buildkit:v0.13.1
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
  with:
	driver: remote
	endpoint: docker-container://buildkitd
```
<br>

## Installation

Docker provides native packages for ecosystem components like `containerd` and `buildx`, but they lag behind open-source releases significantly. So I use my own install scripts for Windows (GitHub Actions) and RISC-V.

### Windows

```yaml
- name: Setup containerd
  run: |
    $version = "1.7.15"
    curl.exe -L https://github.com/containerd/containerd/releases/download/v$version/containerd-$version-windows-amd64.tar.gz -o containerd.tar.gz
    tar.exe xvf containerd.tar.gz

    .\bin\containerd.exe --register-service
    Start-Service containerd

- name: Setup BuildKit
  run: |
    $version = "v0.13.1"
    curl.exe -L https://github.com/moby/buildkit/releases/download/$version/buildkit-$version.windows-amd64.tar.gz -o buildkit.tar.gz
    tar.exe xvf buildkit.tar.gz
    
    .\bin\buildkitd.exe --register-service
    Start-Service buildkitd

- name: Setup Docker Buildx
  run: |
    $version = "v0.13.1"
    curl.exe -L https://github.com/docker/buildx/releases/download/$version/buildx-$version.windows-amd64.exe -o $env:ProgramData\Docker\cli-plugins\docker-buildx.exe

- uses: docker/setup-buildx-action@v3.2.0
  with:
    driver: remote
    endpoint: npipe:////./pipe/buildkitd
```
<br>

### RISC-V
Needs `xz-utils` for Dockerfile `ADD file.tar.xz`
```sh
sudo apt update
sudo apt install wget xz-utils
wget https://github.com/containerd/containerd/releases/download/v2.1.1/containerd-2.1.1-linux-riscv64.tar.gz -O containerd.tar.gz
tar Cxzvf /usr/local containerd.tar.gz
mkdir -p /usr/local/lib/systemd/system/
wget https://raw.githubusercontent.com/containerd/containerd/main/containerd.service -O /usr/local/lib/systemd/system/containerd.service
systemctl daemon-reload
systemctl enable --now containerd

wget https://github.com/opencontainers/runc/releases/download/v1.3.0/runc.riscv64 -O runc
install -m 755 runc /usr/local/sbin/runc

wget https://github.com/moby/buildkit/releases/download/v0.22.0/buildkit-v0.22.0.linux-riscv64.tar.gz -O buildkit.tar.gz
tar Cxzvf /usr/local buildkit.tar.gz
mkdir /etc/buildkit # add cert files here
```
<br>

`/usr/local/lib/systemd/system/buildkitd.service`
```toml
[Unit]
Description=BuildKit
Documentation=https://github.com/moby/buildkit

[Service]
Type=notify
ExecStart=/usr/local/bin/buildkitd --addr tcp://0.0.0.0:1234 --tlscacert /etc/buildkit/ca.pem --tlscert /etc/buildkit/cert.pem --tlskey /etc/buildkit/key.pem --oci-worker-gc-keepstorage 102400
[Install]
WantedBy=multi-user.target
```

```
systemctl daemon-reload
systemctl enable --now buildkitd
```

BuildKit uses 10% of disk by default, so we increase it.
<br>

## Development

It's helpful to access a remote builder locally
```sh
docker buildx create --name riscv64 --bootstrap --use --driver remote --driver-opt cacert=${PWD}/ca.pem,cert=${PWD}/cert.pem,key=${PWD}/key.pem tcp://example.com:1234
```

BuildKit's default cache eviction values don't handle kernel builds too well, cause it uses a ton of disk towards the end (vmlinux). Old cache entries can be reviewed and cleared with
```
docker buildx du > cachestats
docker buildx prune --filter until=72h
```
### Frontends

BuildKit supports custom config files (frontends), like the [[Talos|Talos]] `Pkgfile`, based on OCI artefacts. `docker/dockerfile-upstream` for accessing newer features doesn't have a Windows artefact, but we can build one. I did have to disable dynamic linking (remove `-d`) in the script though.

```sh
PLATFORMS=windows/amd64 ./frontend/dockerfile/cmd/dockerfile-frontend/hack/release master mainline ghcr.io/pl4nty/dockerfile push
```

Unfortunately [building with the frontend fails](https://github.com/moby/buildkit/issues/4892).