---
dg-publish: true
---
[Web content filtering](https://learn.microsoft.com/en-us/defender-endpoint/web-content-filtering) would be a useful security control, if certain admins didn't block the `Uncategorized` category... Lots of cool apps like to use fresh domains. 
Fortunately it's only implemented in browsers using a process allowlist, so I found a few bypasses. `curl` is an obvious one if you don't need a UI. Or in 2025, you could just download [Chrome for Testing](https://googlechromelabs.github.io/chrome-for-testing/) and rename `chrome.exe`.
That was patched (early 2026 I think) by using PE `VersionInfo` instead of file name - so you can just `rcedit-x64.exe chrome.exe --set-version-string "OriginalFilename" check-your-signatures.exe`.
Incidentally, writing this is how I found out `rcedit` is abandoned - so I wrote a replacement that also fixes lots of bugs. [Go check it out here](https://github.com/pl4nty/editpe-cli).

%% Filtering %% used data from Cyren, but later moved to NetStar. Both of them have significant categorization issues.