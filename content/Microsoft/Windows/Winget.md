---
dg-publish: true
---
The Windows Package Manager (winget) uses package metadata from external sources to install Windows apps using traditional packaging technologies.
The official user interface is a [C++ CLI](https://github.com/microsoft/winget-cli) shipped as part of an msix bundle (Microsoft.DesktopAppInstaller), and it also exposes a COM server for other clients like PowerShell and the Intune Management Extension.
## Sources
The default app metadata sources are
* msstore (https://storeedgefd.dsx.mp.microsoft.com/v9.0): Microsoft Store apps, exposed using the REST source type
* winget (https://cdn.winget.microsoft.com/cache): apps from the public winget-pkgs repo, using the preindexed type. it's an SQLite index built from committed yaml, then bundled in an msix

Some third-party sources
* https://pkgmgr-wgrest-pme.azurefd.net/api: built for Intune integration based on [microsoft/winget-cli-restsource](https://github.com/microsoft/winget-cli-restsource), but was eventually disabled
* https://cloudflightio.github.io/winget-pkgs: an interesting preindexed source, using GitHub for manifest storage, Actions to build the index, and Pages to expose it to users. I [added support for Azure Static Web Apps](https://github.com/pl4nty/winget-pkgs-selfhost/pull/1/files) in the hope of enabling authentication, but it's not supported for preindexed sources 

## Authentication
winget sources can be public, require client certificate authentication, or request Entra authentication.

The Entra authentication flow is
1. Check whether authentication is enabled using a GET request to `/information`. If it's Entra, the JSON response will also include the resource ID and scope.
2. Request a token from the [Windows Account Manager](https://learn.microsoft.com/en-us/entra/identity-platform/reference-entra-id-wam-api) (WAM). The request includes the source resource ID and scope, along with the App Installer client ID (`7b8ea11a-7f45-4b3a-ab51-794d5863af15`). It can also include a user principal name (login hint) to prefill if the user is prompted to login, or to select if WAM has cached credentials for multiple accounts. WAM accepts a preference parameter for the login prompt too
	* `silent`: fails if no credentials are available
	* `silentPreferred`: default, tries silent but prompts if needed
	* `interactive`: always prompts
3. WAM uses its standard flow, like with other Microsoft apps. It checks its cache for an access token, or a refresh token to retrieve an access token, and if neither are available it prompts the user to login. This flow also handles consent.
4. If authentication succeeds, winget sends the token to the source in the `Authorization` header, along with a standard REST request like `/manifestSearch`.

![[Pasted image 20240919005509.png|Pasted image 20240919005509.png]]
%%
d2
shape: sequence_diagram
Client -> Source: /information
source -> client: resource + scope
WAM: Windows Account Manager
client -> WAM: client ID + resource + scope
WAM -> Entra: login
Entra -> WAM: token
WAM -> client: token
client -> source: request + token
%%


Want to try out authentication? I've implemented a winget source with authentication, custom installer upload, and support for Amazon S3 storage, but it's not ready to share publicly yet. If you're interested, email me at `[my first name]@tplant.com.au`

If you have your own winget source, here's how to setup authentication. You'll need to create an app registration with a scope, like `user_impersonation`

![[Pasted image 20240919004247.png|Pasted image 20240919004247.png]]

Then authorize the App Installer client ID (`7b8ea11a-7f45-4b3a-ab51-794d5863af15`)

![[Pasted image 20240919004335.png|Pasted image 20240919004335.png]]

Finally, configure your winget REST source to require Entra access tokens for all endpoints except `/information`. For `/information`, you'll need to return the following JSON

```json
{
	"Data": {
		"SourceIdentifier": "your source name",
		"ServerSupportedVersions": [
			"1.7.0"
		],
		"Authentication": {
			"AuthenticationType": "microsoftEntraId",
			"MicrosoftEntraIdAuthenticationInfo": {
				"Resource": "your resource id",
				"Scope": "your scope"
			}
		}
	}
}
```

## Development
winget is developed with C++ and Visual Studio, so I opted for a 32 core F-series Azure VM. I later downgraded to 4 core / 16GB RAM due to poor build parallelism.
It comes with a winget DSC config for easy setup (see the README), but needs an extra command for `vcpkg`. And it only seemed to work for my Release builds, Debug builds failed with a missing dependency of sfsclient.

Build order
* AppInstallerCLIPackage
* AppInstallerCLITests
* `AppInstallerCLITests\Run-TestsInPackage.ps1 -Args "~[pips]" -BuildRoot $PWD\x64\Release\ -PackageRoot $PWD\AppInstallerCLIPackage\bin\x64\Release\ -LogTarget $PWD\AICLI-Packaged.log -ScriptWait`

## Downgrade a package
If the latest release has a critical bug (looking at you Docker Desktop), we can downgrade to an older version with `winget install Docker.DockerDesktop --version 4.34.2 --force --custom "--disable-version-check"`.
`--force` seems necessary to bypass the check for an existing version, otherwise it'll just print this warning and skip the install: `Found an existing package already installed. Trying to upgrade the installed package...`.