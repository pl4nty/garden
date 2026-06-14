---
dg-publish: true
---
[Take a SIP: A Refreshing Look at Subject Interface Packages | Splunk](https://www.splunk.com/en_us/blog/security/take-a-sip-a-refreshing-look-at-subject-interface-packages.html)
A graeber classic [SpecterOps_Subverting_Trust_in_Windows.pdf](https://specterops.io/wp-content/uploads/sites/3/2022/06/SpecterOps_Subverting_Trust_in_Windows.pdf)

> SIPs are designed to dictate how the operating system processes and verifies signatures, ensuring the integrity of files and applications.

Registered under `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography\OID\EncodingType 0`, list from `19045.6332` but I suspect there are changes in Win11.

| GUID                                   | Dll Path                                                  | FuncName                       |
| -------------------------------------- | --------------------------------------------------------- | ------------------------------ |
| {000C10F1-0000-0000-C000-000000000046} | `C:\Windows\System32\MSISIP.DLL`                          | MsiSIPGetSignedDataMsg         |
| {06C9E010-38CE-11D4-A2A3-00104BD35090} | `C:\Windows\System32\wshext.dll`                          | GetSignedDataMsg               |
| {0AC5DF4B-CE07-4DE2-B76E-23C839A09FD1} | `C:\Windows\System32\AppxSip.dll`                         | AppxSipGetSignedDataMsg        |
| {0F5F58B3-AADE-4B9A-A434-95742D92ECEB} | `C:\Windows\System32\AppxSip.dll`                         | AppxBundleSipGetSignedDataMsg  |
| {1629F04E-2799-4DB5-8FE5-ACE10F17EBAB} | `C:\Windows\System32\wshext.dll`                          | GetSignedDataMsg               |
| {1A610570-38CE-11D4-A2A3-00104BD35090} | `C:\Windows\System32\wshext.dll`                          | GetSignedDataMsg               |
| {5598CFF1-68DB-4340-B57F-1CACF88C9A51} | `C:\Windows\System32\AppxSip.dll`                         | P7xSipGetSignedDataMsg         |
| {603BCC1F-4B59-4E08-B724-D2C6297EF351} | `C:\Windows\System32\WindowsPowerShell\v1.0\pwrshsip.dll` | PsGetSignature                 |
| {9BA61D3F-E73A-11D0-8CD2-00C04FC295EE} | `WINTRUST.DLL`                                            | CryptSIPGetSignedDataMsg       |
| {9F3053C5-439D-4BF7-8A77-04F0450A1D9F} | `C:\Windows\System32\EsdSip.dll`                          | EsdSipGetSignature             |
| {C689AAB8-8E78-11D0-8C47-00C04FC295EE} | `WINTRUST.DLL`                                            | CryptSIPGetSignedDataMsg       |
| {C689AAB9-8E78-11D0-8C47-00C04FC295EE} | `WINTRUST.DLL`                                            | CryptSIPGetSignedDataMsg       |
| {C689AABA-8E78-11D0-8C47-00C04FC295EE} | `WINTRUST.DLL`                                            | CryptSIPGetSignedDataMsg       |
| {CF78C6DE-64A2-4799-B506-89ADFF5D16D6} | `C:\Windows\System32\AppxSip.dll`                         | EappxSipGetSignedDataMsg       |
| {D1D04F0C-9ABA-430D-B0E4-D7E96ACCE66C} | `C:\Windows\System32\AppxSip.dll`                         | EappxBundleSipGetSignedDataMsg |
| {DE351A42-8E59-11D0-8C47-00C04FC295EE} | `WINTRUST.DLL`                                            | CryptSIPGetSignedDataMsg       |
| {DE351A43-8E59-11D0-8C47-00C04FC295EE} | `WINTRUST.DLL`                                            | CryptSIPGetSignedDataMsg       |

>BOOL WINAPI CryptSIPVerifyIndirectData( IN      SIP_SUBJECTINFO     IN      SIP_INDIRECT_DATA   *pSubjectInfo, *pIndirectData); 
>
The arguments supplied to these functions are populated by the calling trust provider (more details on the trust provider architecture in sections to follow). When CryptSIPGetSignedDataMsg is called, the SIP will extract the encoded digital signature (a CERT_SIGNED_CONTENT_INFO structure most often ASN.1 PKCS_7_ASN_ENCODING and X509_ASN_ENCODING encoded) and return it via the “pbSignedDataMsg” parameter. The CERT_SIGNED_CONTENT_INFO content consists of the signing certificate (including its issuing chain), the algorithm used to hash and sign the file, and the signed hash of the file.
>
>The calling trust provider then decodes the digital signature, extracts the hash algorithm and signed hash value and passes them to CryptSIPVerifyIndirectData.

