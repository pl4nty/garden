---
{"dg-publish":true,"permalink":"/microsoft/windows/winget/","updated":"2024-09-19T00:56:08.112+10:00"}
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

![Pasted image 20240919005509.png](/img/user/Uploads/Pasted%20image%2020240919005509.png)



Want to try out authentication? I've implemented a winget source with authentication, custom installer upload, and support for Amazon S3 storage, but it's not ready to share publicly yet. If you're interested, email me at `[my first name]@tplant.com.au`

If you have your own winget source, here's how to setup authentication. You'll need to create an app registration with a scope, like `user_impersonation`

![Pasted image 20240919004247.png](/img/user/Uploads/Pasted%20image%2020240919004247.png)

Then authorize the App Installer client ID (`7b8ea11a-7f45-4b3a-ab51-794d5863af15`)

![Pasted image 20240919004335.png](/img/user/Uploads/Pasted%20image%2020240919004335.png)

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
