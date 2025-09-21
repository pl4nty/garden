---
dg-publish: true
---
On Windows, it's updated via HP Display Center - a UWP app built with .NET Framework. The config file leaks the FTP prefix for firmware downloads, including dev/staging: https://ftp.hp.com/pub/danda/com.hp.danda.firmware.bucket/displays/
Server returns "not found" for non-existent, or "not a file" for directories.

ILSpy helps find the remaining params pretty quickly.

```C#
private void InitializeFtpService()  
{  
	MonitorModel displayDto = agentSimoneBridge.GetDisplayDto(DisplayCurrentValues.SelectedDisplaySerialNum);  
	string modelName = displayDto.Model.ModelName;  
	string text = string.Empty;  
	modelName = modelName.Trim().Replace(" ", string.Empty);  
	if (!string.IsNullOrEmpty(modelName))  
	{  
		text = (modelName.StartsWith("HP") ? modelName.Substring(2, modelName.Length - 2) : modelName);  
	}  
	string text2 = text + "\\" + displayDto.Firmware.HwRevision;  
	string packageVersion = (FwUptoDateVersion = displayDto.Firmware.PackageRevision);  
	lastFwUpdatedDate = GetLastUpdatedDate();  
	logger.WriteLog(EventLevel.Informational, "Constructed URL end-part :" + text2);
	fwUpdateService = new FwUpdateService(logger, packageVersion, text2, agentSimoneBridge.BaseFtpPath);  
	cancellationToken = new CancellationTokenSource();  
}
```
## Update Process
Open the on-screen display and get the model name from the top left. Then go to Information and get the HW revision.

Remove spaces from model name, and remove HP from the start if it's there. Then check the XML at `/<model>/<hardware revision>/recipe.xml`
Example:`https://ftp.hp.com/pub/danda/com.hp.danda.firmware.bucket/displays/E45cG5/W2VM1111/recipe.xml`

Replace `recipe.xml` with `<PackageVersion>/FW.zip` parameter to download the firmware.
Example: `https://ftp.hp.com/pub/danda/com.hp.danda.firmware.bucket/displays/E45cG5/W2VM1111/1.50.11.0/FW.zip`