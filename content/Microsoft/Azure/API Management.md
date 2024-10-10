---
{"dg-publish":true,"permalink":"/microsoft/azure/api-management/"}
---

The `set-body` policy can be configured to use the [Liquid](https://shopify.github.io/liquid/basics/introduction/) templating language to transform the body of a request or response.

This is useful for accessing object properties, but doesn't work on arrays because they're not a valid standalone JSON object. Instead, Liquid strips them, eg `[{},{}]` to `{},{}`. 
```xml
<set-body template="liquid">{{body.myarray}}</set-body>
```

Fortunately we can use [JObject](https://learn.microsoft.com/en-us/azure/api-management/set-body-policy#accessing-the-body-as-a-jobject) instead:
```xml
<set-body>@{
	context.Response.Body.As<JToken>()["myarray"].ToString();
}</set-body>
```
