---
dg-publish: true
---
Dynamic consent (`/adminconsent?scope=...`) only works with delegated scopes, not app roles. So if we don't want to consent to all roles (`scope=.default`), we have to call Graph manually. Fortunately Azure CLI has the correct Graph delegated scopes. Unfortunately, the API doesn't use names like My.Scope - it uses GUIDs that we have to lookup manually.

```powershell
$principalId = az ad sp create --id 6c3aeaad-bd44-4bc4-974d-bb05ea509cf2 --query id
$resourceId = az ad sp show --id https://graph.microsoft.com --query id
"7438b122-aefc-4978-80ed-43db9fcc7715","78145de6-330d-4800-a6ce-494ff2d33d07" | ForEach-Object { az rest --method post --url "https://graph.microsoft.com/v1.0/servicePrincipals/$principalId/appRoleAssignments" --body "{\`"principalId\`":\`"$principalId\`",\`"resourceId\`":\`"$resourceId\`",\`"appRoleId\`":\`"$_\`"}" }
```

If you want to programmatically consent to all scopes, there's a legacy endpoint that still works as of writing.

```sh
az ad sp create --id 6c3aeaad-bd44-4bc4-974d-bb05ea509cf2
az rest --method post --url https://main.iam.ad.ext.azure.com/api/RegisteredApplications/6c3aeaad-bd44-4bc4-974d-bb05ea509cf2/Consent?onBehalfOfAll=true --resource 74658136-14ec-4630-ad9b-26e160ff0fc6
```