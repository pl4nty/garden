---
dg-publish: true
---
[Azure Resource Explorer](https://resources.azure.com/) was a handy web app for exploring Azure via the ARM API, but it had been around for over a decade and was [finally killed in June](https://github.com/projectkudu/AzureResourceExplorer/issues/374).
Unfortunately the Ibiza alternative isn't nearly good enough. I [tried upgrading it to .NET 8](https://github.com/pl4nty/AzureResourceExplorer) so I could rehost it on Linux, but I got stuck on the startup functions and middleware. Hopefully someone else can host it on Windows.