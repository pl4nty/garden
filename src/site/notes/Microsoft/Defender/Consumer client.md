---
{"dg-publish":true,"permalink":"/microsoft/defender/consumer-client/","updated":"2024-10-26T19:43:18.929+11:00"}
---

Family client is codenamed Gibraltar or MicrosoftSecurityApp. Unique PPE tenant?

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <configSections></configSections>
  <startup>
    <supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.7.2" />
  </startup>
  <appSettings>
    <!-- This app's activation protocol -->
    <add key="microsoftSecurity:ActivationProtocol" value="microsoftdefender://" />
    <!-- This app's package family name -->
    <add key="microsoftSecurity:PackageFamilyName" value="Microsoft.6365217CE6EB4_8wekyb3d8bbwe" />
    <!-- Registered ClientId for the application with AAD -->
    <add key="aad:ClientId" value="6496ea50-885e-43cd-a67b-da442c10a8a5" />
    <!-- AAD settings -->
    <add key="aad:Instance" value="https://login.microsoftonline.com/{0}/v2.0" />
    <add key="aad:Tenant" value="consumers" />
    <!-- Graph Scope and APIs -->
    <add key="graph:Scope" value="user.read" />
    <add key="graph:Api:Me" value="https://graph.microsoft.com/v1.0/me" />
    <add key="graph:Api:MePhoto" value="https://graph.microsoft.com/beta/me/photo/$value" />
    <add key="graph:Api:MePhoto120" value="https://graph.microsoft.com/beta/me/photos/120x120/$value" />
    <!-- Microsoft.ConsumerSecurity.Portal Scope and APIs -->
    <add key="microsoftSecurity:PPE:Scope" value="api://3a97e270-5f27-441e-956b-e14177afcbce/gibraltar.readwrite" />
    <add key="microsoftSecurity:PPE:Uri" value="https://gb-ppe.microsoft.com/" />
    <add key="microsoftSecurity:PROD:Scope" value="api://EF7F3AFA-3B6A-4DFA-AD81-5F57E2F85175/consumersecurity.readwrite" />
    <add key="microsoftSecurity:PROD:Uri" value="https://mysecurity.microsoft.com/" />
    <add key="microsoftSecurity:Api:Me" value="api/v1/me" />
    <add key="microsoftSecurity:Api:MePhoto120" value="api/v1/me/photos/120x120/$value" />
    <!-- SecureConnection Scope -->
    <add key="secureConnection:PPE:Scope" value="api://c3c78396-7fdb-4ce6-95fc-503acfc5990a/secureconnection.read" />
    <add key="secureConnection:PROD:Scope" value="api://839cbe09-df9c-4419-94c5-0d1b7cc8c450/secureconnection.read" />
    <!-- Upsell -->
    <!-- See: https://www.owiki.ms/wiki/OMEX/Corrib/UniPux/Url-Parameters#Short_Links -->
    <add key="upsell:BaseUrlFamily" value="https://go.microsoft.com/fwlink/?linkid=2234616" />
    <add key="upsell:BaseUrlFamilyTrial" value="https://go.microsoft.com/fwlink/?linkid=2234713" />
    <add key="upsell:BaseUrlPersonal" value="https://go.microsoft.com/fwlink/?linkid=2234515" />
    <add key="upsell:RelativeUrl" value="&amp;language={0}&amp;market={1}&amp;client=defender&amp;ocid={2}&amp;requestedDuration=Year" />
    <add key="upsell:Ocid" value="cmmb8hz4dxf" />
  </appSettings>
  <runtime>
    <!-- Read more about this at https://docs.microsoft.com/en-us/dotnet/framework/whats-new/whats-new-in-accessibility#accessibility-switches
           
           App requestst to activate accessibility fixes available in .NET versions below. 
           Depending on what .NET framework is installed on the machine, this override below will activate accessiblity fixes.
           
           Version	                     Switch
          .NET Framework 4.7.1	        "Switch.UseLegacyAccessibilityFeatures"
          .NET Framework 4.7.2	        "Switch.UseLegacyAccessibilityFeatures.2"
          .NET Framework 4.8	          "Switch.UseLegacyAccessibilityFeatures.3"
          August 11, 2020-KB4569746 	  "Switch.UseLegacyAccessibilityFeatures.4"
          
          AppContextSwitchOverrides value attribute is in the form of 'key1=true;false;key2=true;false  -->
    <AppContextSwitchOverrides value="Switch.UseLegacyAccessibilityFeatures=false;Switch.UseLegacyAccessibilityFeatures.2=false;Switch.UseLegacyAccessibilityFeatures.3=false;Switch.UseLegacyAccessibilityFeatures.4=false" />
    <assemblyBinding xmlns="urn:schemas-microsoft-com:asm.v1">
      <dependentAssembly>
        <assemblyIdentity name="Newtonsoft.Json" publicKeyToken="30ad4fe6b2a6aeed" culture="neutral" />
        <bindingRedirect oldVersion="6.0.8.0-13.0.0.0" newVersion="13.0.0.0" />
      </dependentAssembly>
      <dependentAssembly>
        <assemblyIdentity name="System.Text.Json" publicKeyToken="cc7b13ffcd2ddd51" culture="neutral" />
        <bindingRedirect oldVersion="0.0.0.0-7.0.0.0" newVersion="7.0.0.0" />
      </dependentAssembly>
      <dependentAssembly>
        <assemblyIdentity name="System.Numerics.Vectors" publicKeyToken="b03f5f7f11d50a3a" culture="neutral" />
        <bindingRedirect oldVersion="0.0.0.0-4.1.4.0" newVersion="4.1.4.0" />
      </dependentAssembly>
      <dependentAssembly>
        <assemblyIdentity name="System.Buffers" publicKeyToken="cc7b13ffcd2ddd51" culture="neutral" />
        <bindingRedirect oldVersion="0.0.0.0-4.0.3.0" newVersion="4.0.3.0" />
      </dependentAssembly>
      <dependentAssembly>
        <assemblyIdentity name="System.Memory" publicKeyToken="cc7b13ffcd2ddd51" culture="neutral" />
        <bindingRedirect oldVersion="0.0.0.0-4.0.1.2" newVersion="4.0.1.2" />
      </dependentAssembly>
      <dependentAssembly>
        <assemblyIdentity name="System.Diagnostics.DiagnosticSource" publicKeyToken="cc7b13ffcd2ddd51" culture="neutral" />
        <bindingRedirect oldVersion="0.0.0.0-7.0.0.2" newVersion="7.0.0.2" />
      </dependentAssembly>
      <dependentAssembly>
        <assemblyIdentity name="System.Runtime.CompilerServices.Unsafe" publicKeyToken="b03f5f7f11d50a3a" culture="neutral" />
        <bindingRedirect oldVersion="0.0.0.0-6.0.0.0" newVersion="6.0.0.0" />
      </dependentAssembly>
    </assemblyBinding>
    <assemblyBinding xmlns="urn:schemas-microsoft-com:asm.v1">
      <dependentAssembly>
        <assemblyIdentity name="Polly" publicKeyToken="c8a3ffc3f8f825cc" culture="neutral" />
        <bindingRedirect oldVersion="0.0.0.0-7.0.0.0" newVersion="7.0.0.0" />
      </dependentAssembly>
    </assemblyBinding>
    <assemblyBinding xmlns="urn:schemas-microsoft-com:asm.v1">
      <dependentAssembly>
        <assemblyIdentity name="System.ValueTuple" publicKeyToken="cc7b13ffcd2ddd51" culture="neutral" />
        <bindingRedirect oldVersion="0.0.0.0-4.0.3.0" newVersion="4.0.3.0" />
      </dependentAssembly>
    </assemblyBinding>
  </runtime>
</configuration>
```

XPD Sentinel
```json
{
  "backgroundImage": "xpdBootstrapperBackground.jpg",
  "icon": "xpdBootstrapper.ico",
  "quiet": "false",
  "errorRedirect": "https://www.microsoft.com/en-us/microsoft-365/microsoft-defender-for-individuals",
  "errorBaseUrl": "https://www.microsoft.com/en-us/microsoft-365/microsoft-defender-for-individuals",
  "indirect": "true",
  "sentinel": "https://cdn-windows-client-gibraltar-prod.azureedge.net/oxpd/sentinel_Win11.msix",
  "installWebView2Evergreen": "https://go.microsoft.com/fwlink/p/?LinkId=2124703",
  "enableTelemetry": "true"
}
```