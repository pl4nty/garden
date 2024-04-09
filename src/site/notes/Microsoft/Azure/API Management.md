---
{"dg-publish":true,"permalink":"/microsoft/azure/api-management/","tags":["gardenEntry"]}
---



Liquid strips headless arrays [{},{}] to {},{} cause they're technically not valid JSON. 
```xml
<set-body template="liquid">{{body.data}}</set-body>
```

So we have to use JObject instead:
```xml
<set-body>@{
	context.Response.Body.As<JToken>()["data"].ToString();
}</set-body>
```
