---
dg-publish: true
---
A columnar append-only database, also known as ADX and codenamed Kusto. Extensive use internally including Aria (Windows telemetry), Defender, Log Analytics/Monitor, and maybe Geneva too. The desktop client is Explorer and web is WebExplorer.

## Proxy
It uses standard Entra auth so we can proxy with [[Front Door|Front Door]] or [[API Management|API Management]] to allow a vanity domain. Particularly useful for BCDR, since ADX hostnames require uniqueness and are a combination of the resource name and region.

This approach also allows request sharding, but JWT parsing isn't supported by Front Door or particularly safe (encrypted tokens in future?) so it'd need a custom hint to route by tenant/user IDs. A custom header would work for first-party clients, but not integrations like Defender/Sentinel/WebExplorer.

Custom middleware would have performance impacts, so I tried a native edge solution with Cloudflare Workers. This routes to different clusters based on the `tenant_ctry` claim in the JWT token. If the client respects redirect response codes, GET requests could be further optimised. I've only tested with WebExplorer which uses POSTs for queries.

```js
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  },
};

async function handleRequest(request) {
  try {
    if (request.method === "OPTIONS") {
      return proxyRequest(request, getBackendURL('US'))
    }

    const token = extractJWT(request)
    if (!token) {
      return new Response('Unauthorized', { status: 200 })
    }

    const tenantCountry = getTenantCountryFromJWT(token)
    if (!tenantCountry) {
      return new Response('Unauthorized', { status: 401 })
    }

    const backendURL = getBackendURL(tenantCountry)
    if (!backendURL) {
      return new Response('Invalid tenant country', { status: 400 })
    }

    // if (request.method === 'GET') {
    //   return new Response({}, {
    //     headers: {
    //       'Location': backendURL
    //     },
    //     status: 302
    //   })
    // }

    return proxyRequest(request, backendURL)
  } catch (err) {
    return new Response('Error processing request', { status: 500 })
  }
}

function extractJWT(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.split(' ')[1]
}

function getTenantCountryFromJWT(token) {
  const [header, payload, signature] = token.split('.')
  const decodedPayload = atob(payload)
  const payloadObj = JSON.parse(decodedPayload)
  return payloadObj.tenant_ctry
}

function getBackendURL(tenantCountry) {
  const countryToURLMap = {
    'US': 'https://help.kusto.windows.net',
    'EU': 'https://eu.example.com',
    // Add more mappings as needed
  }
  return countryToURLMap[tenantCountry]
}

async function proxyRequest(request, backendURL) {
  const url = new URL(request.url)
  url.hostname = new URL(backendURL).hostname

  const newRequest = new Request(url.toString(), request)
  const response = await fetch(newRequest)

  return new Response(response.body, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText
  })
}
```

## Network

what API calls does it use for   groups? [Deploy Azure Data Explorer into your Virtual Network - Azure Data Explorer | Microsoft Learn](https://learn.microsoft.com/en-us/azure/data-explorer/vnet-deployment)
try nyxgreek/onedrive_user_enum
vnet injection was deprecated so we can't route through a firewall :(
it was probably TLS anyway

however, #TODO write a proxy with the http_request and \_post plugins? fun internal URLs...


`https://prod.warmpath.msftcloudes.com`
```
"ResponseHeaders": {
	"__HandlingServerId__": "Unknown_Unknown_gcsvm00001Y",
	"x-ms-client-request-id": "74ea01ce-9119-4d9c-8714-158b383139f4",
	"Date": "Wed, 27 Nov 2024 11:25:13 GMT"
},
"ResponseBody": {
	"Message": "Unable to parse MDS environment/MDS account from path /",
	"Code": "BadRequest",
	"StackTrace": "",
	"Details": null
},
"ResponseStatusCode": 400,
"ResponseReasonPhrase": Bad Request
```

```
Callout of type 'webapi' to 'http://169.254.169.254/metadata/instance' has been blocked as it is considered unsafe: Hostname '169.254.169.254': Host failed loopback link local check: 'uri.IdnHost resolves into a forbidden subnet address range' clientRequestId: Kusto.Web.KWE.Query;938f8f5b-a67f-4610-91de-8f3b1a9dc878;2bf838e3-fe39-4211-a1c0-98b263d28f58
```

`evaluate http_request("https://gcs.prod.monitoring.core.windows.net/a/b/c/env/e")`

```
"ResponseHeaders": {
	"__HandlingServerId__": "Unknown_Unknown_gcsvm00001U",
	"x-ms-client-request-id": "7e8ebdae-b014-4aab-8ce9-5a9b63495271",
	"Date": "Wed, 27 Nov 2024 11:30:00 GMT"
},
"ResponseBody": {
	"Message": "Invalid MDS environment value passed, value = env",
	"Code": "BadRequest",
	"StackTrace": "",
	"Details": null
},
"ResponseStatusCode": 400,
"ResponseReasonPhrase": Bad Request

```

`evaluate http_request("https://prod3-passive-dsts.dsts.core.windows.net/v2/wsfederation?wtrealm=svc%3A%2F%2Fsso%40prod.microsofticm.com%2F&wctx=WsFedOwinState%3DFmIYL4Q-fgVj0kccnzj6jlFqL4IHKl6ZNFovKSExiIegIvAnYbLLNLzhkTIffFDta7hEbE4AzLEbCWkmaYROhLXcjT93eecE9s3kZsnzeH_Q-h83WUSPkjcMGRjVP3esfFvgcjckO5ILKZIa4jTV9KO4Ab460pMGz-nHdl7CWNqcpwLxiQtG3Iv3otYSBPmodWoVaGbZ_WqVG5OaHQcIti2cF4sMniMe9mfofcJRi3ZC3WgmXtSLH-sQVWKymoGF5r-wwY_91eRL_lw39Iu8suFXNyK3aei_8CD5KkWuET3C7PFXSWsaLIoWkAYXKJVtw7iaCA&wa=wsignin1.0")`

```
"ResponseHeaders": {
	"Cache-Control": "no-store, no-cache",
	"Pragma": "no-cache",
	"Vary": "Accept-Encoding",
	"request-id": "e2c4d13b-8f3d-414a-90b0-92ea328424d2",
	"x-ms-gateway-esc": "200",
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
	"X-Content-Type-Options": "nosniff",
	"Date": "Wed, 27 Nov 2024 11:38:52 GMT"
},
"ResponseBody": 
	
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
	<html xmlns="http://www.w3.org/1999/xhtml">
	<html lang="en">
	<head id="Head1"><title>
		
	    Sign In
	
	</title>
	<style type="text/css">
	body
	{
		font-family: Arial, Helvetica, sans-serif;
		text-align: center;
		background: #EEEEEE;
	}
	
	div.SignInContent
	{
		text-align: center;
		margin-left: auto;
		margin-right: auto;
		border: solid 1px #BBBBBB;
		position: relative;
		width: 340px;
		border-radius: 15px;
		background: #FFFFFF;
	}
	
	div.Banner
	{
		padding-top:10px;
		padding-bottom:10px;
		text-align: center;
		margin-left: auto;
		margin-right: auto;
		background: #EEEEEE;
		border-top: solid 1px #BBBBBB;
		border-left: solid 1px #BBBBBB;
		border-right: solid 1px #BBBBBB;
		width: 340px;
		visibility: hidden;
	}
	
	div.Header
	{
		padding:10px 10px;
		text-align: center;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 10px;
	}
	
	div.Notice
	{
		padding:10px 10px;
		text-align: center;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 10px;
	    font-size: 14px;
	    color: red;
	}
	
	div.LeftArea
	{
		padding:15px 15px;
		width: 320px; 
		height: 100%;
		top: 0px;
		left: 0px;
	}
	
	div.RightArea
	{
		padding:15px 15px; 
		width: 320px; 
		height: 100%;
		position: absolute;
		top: 0px;
		left: 370px;
	}
	
	div.Divider
	{
		width: 20px;
		height: 100%;
		text-align: center;
		position: absolute;
		top: 10px;
		left: 350px;
	}
	
	div.DividerLine
	{
		width: 1px; 
		height: 45%;
		background: #BBBBBB;
		margin-left: auto;
		margin-right: auto;
	}
	
	button.IdentityProvider
	{
		width: 250px;
		height: 40px;
		text-align: center;
		border: solid 1px #0076cc;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 10px;
		position: relative;
		cursor: pointer;
		font-size: 14px;
		color: #FFFFFF;
		background: #0076cc;
		border-radius: 10px;
	}
	
	img.IdentityProviderImage 
	{ 
		vertical-align: middle;
		position: relative;
	}
	
	button.IdentityProvider:hover 
	{ 
		background: #EEEEEE;
		background: -moz-linear-gradient(bottom, #DDDDDD, #FFFFFF);
		background: -webkit-gradient(linear, left top, left bottom, from(#FFFFFF), to(#DDDDDD));
		filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr='#FFFFFF', EndColorStr='#DDDDDD');
	}
	
	div.TransformableIdentityProvider
	{
	    position: relative;
	    display: inline-block;
	}
	
	div.TransformableIdentityProviderOptions
	{
	    display: none;
	}
	
	div.TransformableIdentityProvider.active > div.TransformableIdentityProviderOptions {
	    display: block;
	}
	
	div.TransformableIdentityProvider.active > button.IdentityProvider {
	    background-color: gray;
	    border-color: gray;
	}
	
	div.TransformableIdentityProviderOptions > button.IdentityProvider {
	    margin-left: 30px;
	    width: 220px;
	}
	
	div.LeftArea.TransformSelected > #IdentityProvidersList > * {
	    display: none;
	}
	
	div.LeftArea.TransformSelected > #IdentityProvidersList > div.TransformableIdentityProvider.active {
	    display: block;
	}
	
	label
	{
		color: red;
	}
	
	.footer {
	   position:fixed;
	   left:0px;
	   bottom:0px;
	   width:100%;
	   background:#0076cc;
	   padding-top: 5px;
	   padding-bottom: 5px;
	   color: #FFFFFF;
	}
	
	.footer A
	{
	    color: #FFFFFF;
	    text-decoration: underline;
	}
	
	.link_divider
	{
	    margin-left: 5px;
	    margin-right: 5px;
	}
	
	h1.WarningHeader
	{
	    color: white;
	    font-weight: bold;
	    font-size: 1.5em;
	}
	
	
	p.WarningText
	{
	    color: white;
	    font-size: 1.25em;
	}
	
	button.WarningButton
	{
		width: 125px;
		height: 40px;
		text-align: center;
		border: solid 1px #BBBBBB;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 10px;
		position: relative;
		cursor: pointer;
		font-size: 1.25em;
		color: #000000;
		background: #FFFFFF;
		border-radius: 10px;
	    font-weight: bold;
	    margin-left: 50px;
	    margin-right: 50px;
	}
	
	button.WarningButton:hover 
	{ 
		background: #EEEEEE;
		background: -moz-linear-gradient(bottom, #DDDDDD, #FFFFFF);
		background: -webkit-gradient(linear, left top, left bottom, from(#FFFFFF), to(#DDDDDD));
		filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr='#FFFFFF', EndColorStr='#DDDDDD');
	}
	
	a:link {
	color: white;
	}
	
	a:visited {
	    color: white;
	}
	</style>
	<link rel="Stylesheet" href="/Areas/SSOManagement2/Theme/acs.css" type="text/css" />
	    <script type="text/javascript">
	    function on_body_load() { 
	    //an empty function
	    }   
	    </script>
	</head>
	
	<body onload="on_body_load()">
	    
	    
	    <div id="Main" style="display:none">
		    <div id="Banner" class="Banner"><b>Sign in to 24890574338442b8bf12112282201329</b></div>
		    <div id="SignInContent" class="SignInContent">
			    <div id="LeftArea" class="LeftArea" style="display:none;">
				    <div class="Header">Sign in with one of these accounts</div>  
				    <div id="IdentityProvidersList"></div><br />
	                <div id="RememberSettings">
				    <input type="checkbox" id="RememberSettingCheckBox" onclick="CheckBoxClicked()"/><label style="color:black" for="RememberSettingCheckBox">Remember my selection</label><br /><br />
	                </div>
				    <div id="RememberSettingText" style="display:none;">This identity will be used for all applications in this browser. <br><br>To use another identity, clear your browser cookies or use in-private mode browsing.</div><br />
				    <div id="MoreOptions" style="display:none;"><a href="" onclick="ShowDefaultSigninPage(); return false;">Show more options</a></div>
			    </div> 
			    <div id="Divider" class="Divider" style="display:none;">
				    <div class="DividerLine"></div>
				    <div>Or</div>
				    <div class="DividerLine"></div>
			    </div>
			    <div id="RightArea" class="RightArea" style="display:none;">
				    <div class="Header">Sign in using your e-mail address:</div>
				    <form onsubmit="EmailAddressEntered(); return false;">
				        <input type="text" id="EmailAddressTextBox" />
				        <input type="submit" id="EmailAddressSubmitButton" value="Submit"/><br /><br />
				        <label id="EmailAddressError"></label>
				    </form>
			    </div>
		    </div>
		</div>
	
	    <script language="javascript" type="text/javascript">
	        var identityProviders = [];
	        var cookieName = "SelectedDstsIdpCookie";
	        var localDstsAuthentication = "Local dSTS Authentication";
	        var cookieExpiration = 30; // days
	        var cookieExpirationLocalDstsAuth = 1; // days
	        var maxImageWidth = 240;
	        var maxImageHeight = 40;
	        var provider = { Name: localDstsAuthentication, LoginUrl: "https://" + window.location.hostname + "/Dsts/SelfFederationPassiveSTS", ImageUrl: "" }; // BCDR Idp object
			var enableOfflineAccessButton = false;
	
	        // This function will be called back by the HRD metadata, and is responsible for displaying the sign-in page.
	        function ShowSigninPage(json) {
	            identityProviders = json;
	            
	            var redirectUrl = GetRememberMySelectionRedirectUrl();
	            if (redirectUrl == null) {
	                ShowIdProvidersPage();
	            } else {
	                window.location = redirectUrl;
	            }
	        }
	
	        function GetRememberMySelectionRedirectUrl() {
	            var cookieValue = GetHRDCookieValue(cookieName);
	            if (cookieValue == null){
	                return;
	            }            
	            var splitCookie = cookieValue.split('+');
	            var federationSetting = splitCookie[0];
	            var transformSetting = splitCookie[1];
	
	            for (var i in identityProviders) {
	                var identityProvider = identityProviders[i];
	                if (identityProvider.Name != federationSetting) {
	                    continue;
	                }
	
	                if (transformSetting == null) {
	                    return identityProvider.LoginUrl;
	                } else if (IsTransformSettingValid(identityProvider, transformSetting)) {
	                    var loginUrlWithTransform = AppendTransformParameterToReplyUrl(identityProvider.LoginUrl, transformSetting);
	                    return loginUrlWithTransform;
	                }
	            }
	
	            return null;
	        }
	
	        function IsTransformSettingValid(identityProvider, transformSetting) {
	            if (identityProvider.Transforms == null) {
	                return false;
	            }
	
	            for (var i in identityProvider.Transforms) {
	                if (identityProvider.Transforms[i] == transformSetting) {
	                    return true;
	                }
	            }
	
	            return false;
	        }
	
	        function ShowIdProvidersPage() {
	            var numIdentityProviderButtons = 0;
	            var showEmailEntry = false;
	            var showMoreOptionsLink = false;
				
	            // Loop through the identity providers
	            for (var i in identityProviders) {
	                // Show all sign-in options if no cookie is set
	                if (identityProviders[i].EmailAddressSuffixes.length > 0) {
	                    showEmailEntry = true;
	                }
	                else {
	                    // Only show a button if there is no email address configured for this identity provider.
	                    AddIdentityProvider(identityProviders[i]);
	                    numIdentityProviderButtons++;
	                }
	            }
	
	            if (numIdentityProviderButtons > 0) {
	                var parser = document.createElement('a');
	                parser.href = identityProviders[0].LoginUrl;
					if(enableOfflineAccessButton) {
						provider.LoginUrl += parser.search;
					}
	            }
	
	            ShowSigninControls(numIdentityProviderButtons, showEmailEntry, showMoreOptionsLink);
	
	            document.getElementById("Main").style.display = "";
	        }
	
	        // Resets the sign-in page to its original state before the user logged in and received a cookie.
	        function ShowDefaultSigninPage() {
	            var numIdentityProviderButtons = 0;
	            var showEmailEntry = false;
	            document.getElementById("IdentityProvidersList").innerHTML = "";
	            for (var i in identityProviders) {
	                if (identityProviders[i].EmailAddressSuffixes.length > 0) {
	                    showEmailEntry = true;
	                }
	                else {
	                    AddIdentityProvider(identityProviders[i]);
	                    numIdentityProviderButtons++;
	                }
	            }
	
	            ShowSigninControls(numIdentityProviderButtons, showEmailEntry, false);
	        }
	
	        //Reveals the sign-in controls on the sign-in page, and ensures they are sized correctly
	        function ShowSigninControls(numIdentityProviderButtons, showEmailEntry, showMoreOptionsLink) {
			
				// Create BCDR Idp button only on non-mobile devices for Offline Access
				if(enableOfflineAccessButton) {
					AddIdentityProvider(provider);
					numIdentityProviderButtons++;
				}
	
	            //Display the identity provider links, and size the page accordingly
	            if (numIdentityProviderButtons > 0) {
	                document.getElementById("LeftArea").style.display = "";
	            }
	            //Show an email entry form if email mappings are configured
	            if (showEmailEntry) {
	                document.getElementById("RightArea").style.display = "";
	                if (numIdentityProviderButtons === 0) {
	                    document.getElementById("RightArea").style.left = "0px";
	                    document.getElementById("LeftArea").style.display = "none";
	                }
	            }
	            //Show a link to redisplay all sign-in options
	            if (showMoreOptionsLink) {
	                document.getElementById("MoreOptions").style.display = "";
	            } else {
	                document.getElementById("MoreOptions").style.display = "none";
	            }
	            //Resize the page if multiple sign-in options are present
	            if (numIdentityProviderButtons > 0 && showEmailEntry) {
	                document.getElementById("SignInContent").style.width = "720px";
	                document.getElementById("Banner").style.width = "720px";
	                document.getElementById("Divider").style.display = "";
	            }
	
	        }
	
	        //Creates a stylized link to an identity provider's login page
			function AddIdentityProvider(identityProvider) {	
	            var idpList = document.getElementById("IdentityProvidersList");
	            var child = identityProvider.Transforms != null && identityProvider.Transforms.length > 0
	              ? CreateTransformableIdentityProviderWidget(identityProvider)
	              : CreateIdentityProviderButton(identityProvider, identityProvider.LoginUrl, GetTopLevelDisplayName(identityProvider.Name))
	            idpList.appendChild(child);	
			}
	
	        function CreateIdentityProviderButton(identityProvider, target, text) {
	            var idpList = document.getElementById("IdentityProvidersList");
				var button = document.createElement("button");
				button.setAttribute("name", identityProvider.Name);
	
	            if (target != null) {
	                button.setAttribute("id", target );
	            }
	
				button.className = "IdentityProvider";
				button.onclick = IdentityProviderButtonClicked;
					
				// Display an image if an image URL is present
				if (identityProvider.ImageUrl.length > 0) {
					
					var img = document.createElement("img");
					img.className = "IdentityProviderImage";
					img.setAttribute("src", identityProvider.ImageUrl);
					img.setAttribute("alt", identityProvider.Name);
					img.setAttribute("border", "0");
					img.onLoad = ResizeImage(img);
					
					button.appendChild(img);
				}
				// Otherwise, display a text link if no image URL is present
				else if (identityProvider.ImageUrl.length === 0) {
				    button.appendChild(document.createTextNode(text));
				}
	
	            return button;
	        }
	
	        function CreateTransformableIdentityProviderWidget(transformableIdentityProvider) {
	            var idpList = document.getElementById("IdentityProvidersList");
	            var leftArea = document.getElementById("LeftArea")
	            var container = document.createElement('div');
	            container.classList.add('TransformableIdentityProvider');
	
	            var active = false
	
	            var toggle = CreateIdentityProviderButton(transformableIdentityProvider, null, GetTopLevelDisplayName(transformableIdentityProvider.Name));
	            toggle.onclick = function() {
	                if (active) {
	                    container.classList.remove("active");
	                    leftArea.classList.remove("TransformSelected")
	                } else {
	                    for (var el of idpList.children) {
	                        if (el != container) {
	                            el.classList.remove("active")
	                        }
	                    }
	                    container.classList.add("active");
	                    leftArea.classList.add("TransformSelected")
	                }
	                active = !active;
	            };
	            container.appendChild(toggle);
	
	            var optionsContainer = document.createElement('div');
	            optionsContainer.classList.add("TransformableIdentityProviderOptions");            
	
	            var nameToProvider = {};
	            for (var i in identityProviders) {
	                var identityProvider = identityProviders[i];
	                nameToProvider[identityProvider.Name] = identityProvider;
	            }
	
	            // create an option for the federation untransformed
	            optionsContainer.appendChild(CreateIdentityProviderButton(transformableIdentityProvider, transformableIdentityProvider.LoginUrl, GetDisplayName(transformableIdentityProvider.Name)));
	
	            for (var i in transformableIdentityProvider.Transforms) {
	                var transform = transformableIdentityProvider.Transforms[i];
	                var identityProvider = nameToProvider[transform];
	
	                if (identityProvider != null) {
	                    var target = AppendTransformParameterToReplyUrl(transformableIdentityProvider.LoginUrl, transform);
	                    var button = CreateIdentityProviderButton(identityProvider, target, GetDisplayName(transform));
	                    button.setAttribute("name", transformableIdentityProvider.Name + "+" + transform);
	
	                    optionsContainer.appendChild(button);
	                }
	            }
	
	            container.appendChild(optionsContainer);
	
	            return container;
	        }
	
	        function AppendTransformParameterToReplyUrl(redirectUrlStr, key) {
	            var redirectUrl = new URL(redirectUrlStr);
	            var replyUrl = new URL(redirectUrl.searchParams.get('wreply'));
	            replyUrl.searchParams.append('fed-transform', key);
	            redirectUrl.searchParams.set('wreply', replyUrl.toString());
	            return redirectUrl.toString();
	        }
	
	        function GetDisplayName(identityProviderName) {
	            if (identityProviderName.toLowerCase() === "msit-adfs-federation") {
	                return "@microsoft.com";
	            } else if (identityProviderName.toLowerCase() === "gme-adfs-federation") {
	                return "@gme.gbl";
	            } else if (identityProviderName.toLowerCase() === "mc-adfs-federation") {
	                return "@cme.gbl";
	            } else if (identityProviderName.toLowerCase() === "usme-adfs-federation") {
	                return "@usme.gbl";
	            } else if (identityProviderName.toLowerCase() === "bf-adfs-federation") {
	                return "@deme.gbl";
	            } else if (identityProviderName.toLowerCase() === "accenture-adfs-federation") {
	                return "@accenture.com";
				} else if (enableOfflineAccessButton && identityProviderName === localDstsAuthentication) {
	                return "Offline Access";
	            } else if (identityProviderName.toLowerCase() === "ame-adfs-federation") {
	                return "@ame.gbl";
	            } else if (identityProviderName.toLowerCase() === "torus-adfs-federation") {
	                return "@torus";
	            } else if (identityProviderName.toLowerCase() === "pme-adfs-federation") {
	                return "@pme.gbl";
	            } else if (identityProviderName.toLowerCase() === "msftgreen-adfs-federation") {
	                return "@msftgreen";
	            } else if (identityProviderName.toLowerCase() == "anme-adfs-federation") {
	                return "@anme.gbl";
	            } else if (identityProviderName.toLowerCase() == "dcme-adfs-federation") {
	                return "@dcme.gbl";
	            } else if (identityProviderName.toLowerCase() == "mpa-adfs-federation") {
	                return "@mpa.core.microsoft";
	            }
	
	            return identityProviderName;
	        }
	
	        function GetTopLevelDisplayName(identityProviderName) {
	            return GetDisplayName(identityProviderName) + " account";
	        }
	
	        // Gets the name of the remembered identity provider in the cookie, or null if there isn't one.
	        function GetHRDCookieValue(name) {
	            var cookie = document.cookie;
	            if (cookie.length > 0) {
	                var cookieStart = cookie.indexOf(name + "=");
	                if (cookieStart >= 0) {
	                    cookieStart += name.length + 1;
	                    var cookieEnd = cookie.indexOf(";", cookieStart);
	                    if (cookieEnd == -1) {
	                        cookieEnd = cookie.length;
	                    }
	                    return unescape(cookie.substring(cookieStart, cookieEnd));
	                }
	            }
	            return null;
	        }
	
	        // Sets a cookie with a given name. Setting a persistent cookie.
	        function SetCookie(name) {
	            var expiration = new Date();
	            if (name == localDstsAuthentication) {
	                expiration.setDate(expiration.getDate() + cookieExpirationLocalDstsAuth); // Setting only 1 day for BCDR authentication
	            } else {
	                expiration.setDate(expiration.getDate() + cookieExpiration);
	            }
	            var secure = "";
	            var domain = window.location.hostname.substring(window.location.hostname.indexOf(".dsts.core"));
	
	            
	                secure = ";secure";
	            
	
	            document.cookie = cookieName + "=" + escape(name) + ";expires=" + expiration.toUTCString() + secure + ";domain=" + domain + ";path=/";
	        }
	
	        // Sets a cookie to remember the chosen identity provider if the rememeber setting check box was selected
	        function IdentityProviderButtonClicked() {
	            var checkbox = document.getElementById("RememberSettingCheckBox");
	            if (checkbox.checked) {
	                SetCookie(this.getAttribute("name"));
	            }
	            window.location = this.getAttribute("id");
	            return false;
	        }
	
	        // Remember setting check box on clicking will show the extra text on how to clear cookies
	        function CheckBoxClicked() {
	            var checkbox = document.getElementById("RememberSettingCheckBox");
	            var rememberSettingText = document.getElementById("RememberSettingText");
	            var signInContent = document.getElementById("SignInContent");
	            if (checkbox.checked) {
	                rememberSettingText.style.display = "";
	                signInContent.style.height = signInContent.clientHeight+120 + "px"; // Increase the signin content area
	            } else {
	                rememberSettingText.style.display = "none";
	                signInContent.style.height = signInContent.clientHeight-120 + "px"; // Decrease the signin content area
	            }
	        }
	
	        function SetEmailError(string) {
	            var EmailAddressError = document.getElementById("EmailAddressError");
	            if (EmailAddressError.hasChildNodes()) {
	                EmailAddressError.replaceChild(document.createTextNode(string), EmailAddressError.firstChild);
	            }
	            else {
	                EmailAddressError.appendChild(document.createTextNode(string));
	            }
	        }
	
	        function EmailAddressEntered() {
	            var enteredEmail = document.getElementById("EmailAddressTextBox").value;
	            var identityProvider = null;
	            if (enteredEmail.length === 0) {
	                SetEmailError("Please enter an e-mail address.");
	                return;
	            }
	
	            if (enteredEmail.indexOf("@") <= 0) {
	                SetEmailError("Please enter a valid e-mail address.");
	                return;
	            }
	
	            var enteredDomain = enteredEmail.split("@")[1].toLowerCase();
	            for (var i in identityProviders) {
	                for (var j in identityProviders[i].EmailAddressSuffixes) {
	                    if (enteredDomain == identityProviders[i].EmailAddressSuffixes[j].toLowerCase()) {
	                        identityProvider = identityProviders[i];
	                    }
	                }
	            }
	
	            if (identityProvider === null) {
	                SetEmailError("" + "'" + enteredDomain + "'" + " is not a recognized e-mail domain.");
	                return;
	            }
	
	            // If we have gotten this far the e-mail address suffix was recognized. Write a cookie and redirect to the login URL.
	            SetCookie(identityProvider.Name);
	            window.location = identityProvider.LoginUrl;
	        }
	        
	        // If the image is larger than the button, scale maintaining aspect ratio.
	        function ResizeImage(img) {
		        if (img.height > maxImageHeight || img.width > maxImageWidth) {
		            var resizeRatio = 1;
		            if( img.width/img.height > maxImageWidth/maxImageHeight )
		            {
		                // Aspect ratio wider than the button
		                resizeRatio = maxImageWidth / img.width;
			        }
			        else
			        {
			            // Aspect ratio taller than or equal to the button
			            resizeRatio = maxImageHeight / img.height;
			        }
			        
	                img.setAttribute("height", img.height * resizeRatio);
			        img.setAttribute("width", img.width * resizeRatio);
		        }
	        }
	
	    </script>
	    <!-- This script gets the HRD metadata in JSON and calls the callback function which renders the links -->
	    <script src="https://prod3-passive-dsts.dsts.core.windows.net/v2/metadata/IdentityProviders.js?protocol=wsfederation&amp;realm=svc%3a%2f%2fsso%40prod.microsofticm.com%2f&amp;reply_to=&amp;context=WsFedOwinState%3dFmIYL4Q-fgVj0kccnzj6jlFqL4IHKl6ZNFovKSExiIegIvAnYbLLNLzhkTIffFDta7hEbE4AzLEbCWkmaYROhLXcjT93eecE9s3kZsnzeH_Q-h83WUSPkjcMGRjVP3esfFvgcjckO5ILKZIa4jTV9KO4Ab460pMGz-nHdl7CWNqcpwLxiQtG3Iv3otYSBPmodWoVaGbZ_WqVG5OaHQcIti2cF4sMniMe9mfofcJRi3ZC3WgmXtSLH-sQVWKymoGF5r-wwY_91eRL_lw39Iu8suFXNyK3aei_8CD5KkWuET3C7PFXSWsaLIoWkAYXKJVtw7iaCA&amp;request_id=&amp;version=1.0&amp;callback=ShowSigninPage" type="text/javascript"></script>
	    
	    
	            <br />
	            <div class="footer">
	                Â© 2024 Microsoft Corporation. All rights reserved. <a href=https://msdpn.azurewebsites.net/default?LID=62>Privacy Policy</a>
	            </div>
	    
	</body>
	</html>
	,
"ResponseStatusCode": 200,
"ResponseReasonPhrase": OK

```

`/v1/rest/auth/metadata`
```
{
  "AzureAD": {
    "LoginEndpoint": "https://login.microsoftonline.com",
    "LoginMfaRequired": false,
    "KustoClientAppId": "db662dc1-0cfe-4e1c-a843-19a68e65be58",
    "KustoClientRedirectUri": "http://localhost",
    "KustoServiceResourceId": "https://kusto.kusto.windows.net",
    "FirstPartyAuthorityUrl": "https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a"
  },
  "dSTS": {
    "CloudEndpointSuffix": "windows.net",
    "DstsRealm": "realm://dsts.core.windows.net",
    "DstsInstance": "prod-dsts.dsts.core.windows.net",
    "KustoDnsHostName": "kusto.windows.net",
    "ServiceName": "kusto",
    "KustoDstsServiceId": "4d248be5-f7bb-4cb0-95b6-36fb9e4f97a8",
    "DstsJWTAuthorityAddress": "https://prod-passive-dsts.dsts.core.windows.net/dstsv2/7a433bfc-2514-4697-b467-e0933190487f"
  },
  "AzureSettings": {
    "CloudName": "PublicCloud",
    "AzureRegion": "Australia East",
    "Classification": "External"
  }
}

```

Burp plugin to proxy requests via ADX. Fails on certain URLs due to limits of GET API, but POST JSON isn't easily usable via Burp

```python
# Recommended to use the pyscripter-er base script found here https://github.com/lanmaster53/pyscripter-er
# to be placed into the python environment directory

from pyscripterer import BaseScript as Script
from java.net import URL
import json

args = [extender, callbacks, helpers, toolFlag, messageIsRequest, messageInfo, macroItems]

script = Script(*args)

endpoint = 'https://adx-vnetinject.australiaeast.kusto.windows.net/v2/rest/query?db=temp&csl='
token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Inp4ZWcyV09OcFRrd041R21lWWN1VGR0QzZKMCIsImtpZCI6Inp4ZWcyV09OcFRrd041R21lWWN1VGR0QzZKMCJ9.eyJhdWQiOiJodHRwczovL2hlbHAua3VzdG8ud2luZG93cy5uZXQvIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvZTExNjZkYWEtNmNkYS00ZWQ0LTk4NzktZmZkZjc3YzUxY2Y1LyIsImlhdCI6MTczMjc5NjAyNSwibmJmIjoxNzMyNzk2MDI1LCJleHAiOjE3MzI4MDEzMjMsImFjciI6IjEiLCJhaW8iOiJBWVFBZS84WUFBQUEwc0NoRk9JTHhCS0VpZnRSR2RmZ29uVjlCb1VmQ2FVbGZPSHZZMmlCSWUzbWNaTjlxUW05NmFrd2pUMkR6bVNtaXE5Q0FVL2JRejFXVkNFWUIzalNPYjZvTGtBenNmNy9LTGJnWVZ5QXdwRXExeUViU2Q2UXBjaWw0ZnRnR21DYnlsUjN4MnZJc2RYVXRzdnhFMDRvamo0YUYreitPTUhRUS9MUVFBb0R4MW89IiwiYWx0c2VjaWQiOiIxOmxpdmUuY29tOjAwMDMwMDAwMjEwODU3MDIiLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcGlkIjoiMDg2MTc1MjEtNmQ3Ni00ZWIwLWIzMzYtYTllZmVmMGQ4YTY4IiwiYXBwaWRhY3IiOiIwIiwiY3RyeSI6IkFVIiwiZW1haWwiOiJ0b21AdHBsYW50LmNvbS5hdSIsImZhbWlseV9uYW1lIjoiUGxhbnQiLCJnaXZlbl9uYW1lIjoiVG9tIiwiaWRwIjoibGl2ZS5jb20iLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIyNDAzOjU4MTY6Y2QzYTowOjMwOGM6YjU2ZjplZTM6MmM2OCIsIm5hbWUiOiJUb20gUGxhbnQiLCJvaWQiOiIwZjFkZGVlNy03YTE0LTQ2YzMtOWU4My01NzY5N2IxZDI4ZWIiLCJwdWlkIjoiMTAwMzIwMDA4RjE0OEQ3MyIsInJoIjoiMS5BVUlBcW0wVzRkcHMxRTZZZWZfZmQ4VWM5WGZxUmljQ1IwVkxnTW84bC1hQTZMZnFBUEpDQUEuIiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiZjctNzBMZERJRUp0RC13UnBZS3VUV19jdy1ZZ0xvUVRobHRMcXpMdGlPQSIsInRlbmFudF9jdHJ5IjoiQVUiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiT0MiLCJ0aWQiOiJlMTE2NmRhYS02Y2RhLTRlZDQtOTg3OS1mZmRmNzdjNTFjZjUiLCJ1bmlxdWVfbmFtZSI6ImxpdmUuY29tI3RvbUB0cGxhbnQuY29tLmF1IiwidXRpIjoiamJydGZvaUIza1dreG51MDFuS1BBQSIsInZlciI6IjEuMCIsInhtc19pZHJlbCI6IjIgMSJ9.BtBrM4xnyIcCm-kalYoBE_3qnH-8SwBIUx_xqDoNNVH22Og13y4Na-i8J872Fz_311ihQdY1h6F-WQ6XkHZvTxQb_OVNfesA7Wo7NAJaRyKxZ2SXUFnXGKVxWO6J7ZWbi37ffMSM-79wxzd_eWZjhQW8l1H2qSJRffV_cn9TVgsFOuy9DWNkMhqqAjsYwXWUTknzdXRXf4T93AQx7NVg8MDIlJ5m3LBz6lEVv7dtUn1K88SovmSJhBNMCN9w62LExMGlUDroCea2ur4UscWXjVBU7iRPHKFpALZMLdBfHwxl-wvkF1AEnH588R1b8Oqv_UIBXXqGW7uRPpvG5JKEtg'

if messageIsRequest:
	info = helpers.analyzeRequest(messageInfo)
	url = helpers.urlEncode(info.url.toString())

	if info.method == 'GET':
		query = 'evaluate http_request("{}")'.format(url)
	elif info.method == 'POST':
		newHeaders = []
		# exclude the	first header since it is the request line
		for h in info.headers[1:]:
			parts = h.split(': ')
			newHeaders.append({parts[0]: parts[1]})
		query = 'evaluate http_request_post("{}", dynamic({}))'.format(url, json.dumps(newHeaders))
	else:
		exit()
	print(query)

	middle_req = helpers.buildHttpRequest(URL(endpoint + query))
	middle_info = helpers.analyzeRequest(middle_req)

	headers = middle_info.headers
	print(headers)
	headers.add('Authorization: Bearer {}'.format(token))

	new_req = helpers.buildHttpMessage(headers, None)
	messageInfo.request = new_req
	messageInfo.setHttpService(helpers.buildHttpService('adx-vnetinject.australiaeast.kusto.windows.net', 443, 'https'))
else:
	info = helpers.analyzeResponse(messageInfo.response)
	body = messageInfo.response[info.getBodyOffset():]
	body = json.loads(helpers.bytesToString(body))

	newHeaders = [info.headers[0].encode('utf-8')]
	headers = json.loads(body[2]['Rows'][0][0])
	# for k,v in headers.items():
	#	newHeaders.append('{}: {}'.format(k, v))
	print(info.headers)
	print(headers)
	print(newHeaders)

	messageInfo.response = helpers.buildHttpMessage(list(newHeaders), body[2]['Rows'][0][1])
```