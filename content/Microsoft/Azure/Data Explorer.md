---
{"dg-publish":true,"permalink":"/microsoft/azure/data-explorer/","updated":"2024-07-13T17:09:40.424+10:00"}
---

A columnar append-only database, also known as ADX and codenamed Kusto. Extensive use internally including Aria (Windows telemetry), Defender, Log Analytics/Monitor, and maybe Geneva too. The desktop client is Explorer and web is WebExplorer.

## Proxy
It uses standard Entra auth so we can proxy with [[Microsoft/Azure/Front Door\|Front Door]] or [[Microsoft/Azure/API Management\|API Management]] to allow a vanity domain. Particularly useful for BCDR, since ADX hostnames require uniqueness and are a combination of the resource name and region.

This approach also allows request sharding, but JWT parsing isn't supported by Front Door or particularly safe (encrypted tokens in future?) so it'd need a custom hint to route by tenant/user IDs. A custom header would work for first-party clients, but not integrations like Defender/Sentinel/WebExplorer.

Custom middleware would have performance impacts, so I tried a native edge solution with Cloudflare Workers. This routes to different clusters based on the `tenant_ctry` claim. If the client respects redirect response codes, GET requests could be further optimised. I've only tested with WebExplorer which uses POSTs for queries.

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