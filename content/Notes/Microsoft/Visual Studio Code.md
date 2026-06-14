---
dg-publish: true
---
## Extension Development
@vscode/test-web in [[Dev Containers|Dev Containers]] opens, but [extension `UriHandler`s are broken](https://github.com/microsoft/vscode-test-web/issues/19) like authentication providers (`vscode.authentication.getSession`). So we have to [sideload on vscode.dev](https://code.visualstudio.com/api/extension-guides/web-extensions#test-your-web-extension-in-vscode.dev) instead.