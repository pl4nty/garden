---
{"dg-publish":true,"permalink":"/microsoft/visual-studio-code/","updated":"2024-09-07T23:48:09.876+10:00"}
---

## Extension Development
@vscode/test-web in [[Microsoft/Dev Containers\|Dev Containers]] opens, but [extension `UriHandler`s are broken](https://github.com/microsoft/vscode-test-web/issues/19) like authentication providers (`vscode.authentication.getSession`). So we have to [sideload on vscode.dev](https://code.visualstudio.com/api/extension-guides/web-extensions#test-your-web-extension-in-vscode.dev) instead.