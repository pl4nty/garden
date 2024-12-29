---
dg-publish: true
---
Administrative XML (ADMX) is an XML-based file format for defining Group Policy settings in Windows, superseding the bespoke ADM format.
They provide a structured way to manage registry-based policy settings, including language resource files (ADMLs) for rendering a user interface.
Active Directory Group Policy Objects (GPOs) or management engines like Intune can often ingest and use ADMX/ADMLs.
## Creation
Windows native apps typically use the registry for configuration, unlike Linux and its file-based approach.
A lot of apps provide ADMX/ADML files to simplify admin-driven configuration, but plenty don't, and admins often end up using PowerShell because ADMX is very painful to write from scratch.

The community has build simpler solutions, like [FSLogix admxgen](https://github.com/FSLogix/admxgen/), but they're usually command-line and tricky to use.
Let's fix that. We can build an accessible web interface to create the files, based on user input or an exported registry file (.reg).

It's available here: https://admxgen.tplant.com.au

The generated files can be [imported into Intune](https://learn.microsoft.com/en-us/mem/intune/configuration/administrative-templates-import-custom) or [added to the Group Policy Central Store](https://learn.microsoft.com/en-us/troubleshoot/windows-client/group-policy/create-and-manage-central-store).

Registry keys and value names can be added in the UI

![[Pasted image 20241031003225.png|Pasted image 20241031003225.png]]

Or by creating them in the Registry Editor, exporting them to a .reg file, and using the "Upload .reg" button

![[Pasted image 20241030212019.png|Pasted image 20241030212019.png]]

![[Pasted image 20241031003159.png|Pasted image 20241031003159.png]]

Which generates this ADMX and an en-US ADML

```xml
<?xml version="1.0" encoding="utf-8"?>
<policyDefinitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" revision="1.0" schemaVersion="1.0" xmlns="http://www.microsoft.com/GroupPolicy/PolicyDefinitions">
  <policyNamespaces>
    <target prefix="amazon" namespace="appstream" />
  </policyNamespaces>
  <resources minRequiredRevision="1.0" />
  <supportedOn>
    <definitions>
      <definition name="windowsSUPPORTED_Windows7" displayName="$(string.windowsSUPPORTED_Windows7_Definition)" />
    </definitions>
  </supportedOn>
  <categories>
    <category name="Default" displayName="$(string.Default_Category)" />
  </categories>
  <policies>
    <policy name="AutoUpdateDisabled" class="Machine" displayName="$(string.AutoUpdateDisabled_Display)" explainText="$(string.AutoUpdateDisabled_Explain)" presentation="$(presentation.AutoUpdateDisabled)" key="SOFTWARE\Amazon\AppStream Client">
      <parentCategory ref="Default" />
      <supportedOn ref="windowsSUPPORTED_Windows7" />
      <elements>
        <text id="AutoUpdateDisabled" key="SOFTWARE\Amazon\AppStream Client" valueName="AutoUpdateDisabled" required="true" />
      </elements>
    </policy>
  </policies>
</policyDefinitions>
```

![[Pasted image 20241031003506.png|Pasted image 20241031003506.png]]