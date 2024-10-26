---
dg-publish: true
---
https://security.microsoft.com

`POST /`
OAuth 2.0 auth code grant with `response_mode=form_post`
* `code`
* `id_token`: [JWT Playground](https://jwtms.tplant.com.au/#id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjNQYUs0RWZ5Qk5RdTNDdGpZc2EzWW1oUTVFMCIsImtpZCI6IjNQYUs0RWZ5Qk5RdTNDdGpZc2EzWW1oUTVFMCJ9.eyJhdWQiOiI4MGNjY2E2Ny01NGJkLTQ0YWItODYyNS00Yjc5YzRkYzc3NzUiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC88dGlkPi8iLCJpYXQiOjE3Mjk5MzA3NzMsIm5iZiI6MTcyOTkzMDc3MywiZXhwIjoxNzI5OTM0NjczLCJhaW8iOiJBWFFBaS84WUFBQUF2Rm9hOTFQanN0eWxjT09vSzk3WUh0MVZkMGtXNlF6WkFwR3FhU1Rqeld4WEFlU1ZVMXBpN1E4ekQ0UXR6MDgvZXdvV0dYaGFjVG9vdXhNWmR2SVZvVHZqYkU1ZkdSd2l2VzFwbEdYWTBod0FSMXBSY0RUSklYcHBUS1Z3TFhPU05CeTZxM3ppVUVwUGMySmo4MFkwQ3c9PSIsImFsdHNlY2lkIjoiMTpsaXZlLmNvbTowMDAzMDAwMDIxMDg1NzAyIiwiYW1yIjpbInB3ZCIsIm1mYSJdLCJjX2hhc2giOiJXVi11Q2swMDJ5cUJhZFRiX2piNF9nIiwiZW1haWwiOiI8c25pcD4iLCJmYW1pbHlfbmFtZSI6IlBsYW50IiwiZ2l2ZW5fbmFtZSI6IlRvbSIsImlkcCI6ImxpdmUuY29tIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiPHNuaXA+IiwibmFtZSI6InRvbSIsIm5vbmNlIjoiNjM4NjU1Mjc4NTI2NDMzODQ3Lk1EQmtNemMyTVRRdE56YzFPQzAwTW1Ka0xXSXdPVGN0WVRCak9XWXpaamRpWkRNNFltRTBZVE00T1dRdE16ZGlaUzAwTkdKbExXSm1NR0l0TmpsalpqSTNaV0l6Tm1ReiIsIm9pZCI6IjBlMWU3ZDM1LWQwNDMtNDU1Ni1hOGE5LTM2MGRmN2Y0YWU1OCIsInByb3ZfZGF0YSI6W3siYXQiOnRydWUsInByb3YiOiJsaW5rZWRpbi5jb20iLCJhbHRzZWNpZCI6IkRnR0xPRUZtUGxOV3lRenFzZGNfOWk1X3lQeVdEd1ljV2FwYkdyYkx5T3cifV0sInB1aWQiOiIxMDAzMjAwMzU0OTM5QkFEIiwicmgiOiIwLkFVRUFkVW9uZHhqellFLXpHVmZYNHdFb0pXZkt6SUM5Vkt0RWhpVkxlY1RjZDNYc0FBYy4iLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJyN2o4MjduRjY2Snljc3R0UG1nc2xJZjlvUmFTWEhLZzktSXFYNnhnY0Y0IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik9DIiwidGlkIjoiPHRpZD4iLCJ1bmlxdWVfbmFtZSI6IjxzbmlwPiIsInV0aSI6Il9JZE1NLTUxUVU2ZDNzbDk5SnNYQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbIjYyZTkwMzk0LTY5ZjUtNDIzNy05MTkwLTAxMjE3NzE0NWUxMCIsIjEzYmQxYzcyLTZmNGEtNGRjZi05ODVmLTE4ZDNiODBmMjA4YSJdLCJ4bXNfY2MiOlsiQ1AxIl0sInhtc19pZHJlbCI6IjUyNiJ9)
* `state`: `OpenIdConnect.AuthenticationProperties=<encrypted?>`
* `session_state` guid
* `correlation_id` guid
Returns `sccauth` cookie and redirect

`GET /v2/advanced-hunting?tid=<tenant ID>` with `sccauth` cookie
Returns page + `XSRF-TOKEN` cookie

`GET /apiproxy/mtp/huntingService/schema` with `sccauth` cookie and `X-XSRF-TOKEN` header
Advanced Hunting table metadata and schemas for the authenticated tenant
```json
{
  "Tables": [
    {
      "Schema": [
        {
          "Description": "Date and time when the record was generated",
          "Type": "DateTime",
          "Entity": null,
          "Name": "Timestamp"
        },
        {
          "Description": "Unique identifier for the alert",
          "Type": "String",
          "Entity": "Alert",
          "Name": "AlertId"
        },
        {
          "Description": "Title of the alert",
          "Type": "String",
          "Entity": null,
          "Name": "Title"
        },
        {
          "Description": "Type of threat indicator or breach activity identified by the alert",
          "Type": "String",
          "Entity": null,
          "Name": "Category"
        },
        {
          "Description": "Indicates the potential impact (high, medium, or low) of the threat indicator or breach activity identified by the alert",
          "Type": "String",
          "Entity": null,
          "Name": "Severity"
        },
        {
          "Description": "Product or service that provided the alert information",
          "Type": "String",
          "Entity": null,
          "Name": "ServiceSource"
        },
        {
          "Description": "Detection technology or sensor that identified the notable component or activity",
          "Type": "String",
          "Entity": null,
          "Name": "DetectionSource"
        },
        {
          "Description": "MITRE ATT&CK techniques associated with the activity that triggered the alert",
          "Type": "String",
          "Entity": null,
          "Name": "AttackTechniques"
        }
      ],
      "TableSection": "AlertsAndObservations",
      "TableRetention": {
        "HotDays": 30,
        "ColdDays": 0,
        "TotalInteractiveDays": 30
      },
      "TableType": "Regular",
      "Tags": null,
      "HasData": true,
      "Name": "AlertInfo"
    }
  ],
  "Functions": null
}
```

`POST /apiproxy/mtp/huntingService/queryExecutor?useFanOut=false` with `sccauth` cookie and `X-XSRF-TOKEN` header
Executes an Advanced Hunting query with the following parameters, similar to Graph's [runHuntingQuery](https://learn.microsoft.com/en-us/graph/api/security-security-runhuntingquery?view=graph-rest-1.0&tabs=http)
```json
{
    "QueryText": "AADSignInEventsBeta | getschema",
    "StartTime": "2024-10-19T08:39:36.820Z",
    "EndTime": "2024-10-26T08:39:36.820Z",
    "MaxRecordCount": null,
    "TenantIds": null,
    "tenantIds": null,
    "selectedWorkspaces": null
}
```

Results
```json
{
    "Quota": {
        "QueryCpuUsage": 0,
        "CpuLoad": 0,
        "ExecutionTime": "00:00:01.1144704",
        "TotalCpuTime": "00:00:00"
    },
    "ChartVisualization": {
        "ChartType": "None"
    },
    "Schema": [
        {
            "Name": "ColumnName",
            "Type": "String",
            "Entity": null
        },
        {
            "Name": "ColumnOrdinal",
            "Type": "Int32",
            "Entity": null
        },
        {
            "Name": "DataType",
            "Type": "String",
            "Entity": null
        },
        {
            "Name": "ColumnType",
            "Type": "String",
            "Entity": null
        }
    ],
    "Results": [
        {
            "ColumnName": "Timestamp",
            "ColumnOrdinal": 0,
            "DataType": "System.DateTime",
            "ColumnType": "datetime"
        },
        {
            "ColumnName": "Application",
            "ColumnOrdinal": 1,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "ApplicationId",
            "ColumnOrdinal": 2,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "LogonType",
            "ColumnOrdinal": 3,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "EndpointCall",
            "ColumnOrdinal": 4,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "ErrorCode",
            "ColumnOrdinal": 5,
            "DataType": "System.Int32",
            "ColumnType": "int"
        },
        {
            "ColumnName": "CorrelationId",
            "ColumnOrdinal": 6,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "SessionId",
            "ColumnOrdinal": 7,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "AccountDisplayName",
            "ColumnOrdinal": 8,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "AccountObjectId",
            "ColumnOrdinal": 9,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "AccountUpn",
            "ColumnOrdinal": 10,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "IsExternalUser",
            "ColumnOrdinal": 11,
            "DataType": "System.Int32",
            "ColumnType": "int"
        },
        {
            "ColumnName": "IsGuestUser",
            "ColumnOrdinal": 12,
            "DataType": "System.SByte",
            "ColumnType": "bool"
        },
        {
            "ColumnName": "AlternateSignInName",
            "ColumnOrdinal": 13,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "LastPasswordChangeTimestamp",
            "ColumnOrdinal": 14,
            "DataType": "System.DateTime",
            "ColumnType": "datetime"
        },
        {
            "ColumnName": "ResourceDisplayName",
            "ColumnOrdinal": 15,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "ResourceId",
            "ColumnOrdinal": 16,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "ResourceTenantId",
            "ColumnOrdinal": 17,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "DeviceName",
            "ColumnOrdinal": 18,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "AadDeviceId",
            "ColumnOrdinal": 19,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "OSPlatform",
            "ColumnOrdinal": 20,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "DeviceTrustType",
            "ColumnOrdinal": 21,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "IsManaged",
            "ColumnOrdinal": 22,
            "DataType": "System.Int32",
            "ColumnType": "int"
        },
        {
            "ColumnName": "IsCompliant",
            "ColumnOrdinal": 23,
            "DataType": "System.Int32",
            "ColumnType": "int"
        },
        {
            "ColumnName": "AuthenticationProcessingDetails",
            "ColumnOrdinal": 24,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "AuthenticationRequirement",
            "ColumnOrdinal": 25,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "TokenIssuerType",
            "ColumnOrdinal": 26,
            "DataType": "System.Int32",
            "ColumnType": "int"
        },
        {
            "ColumnName": "RiskLevelAggregated",
            "ColumnOrdinal": 27,
            "DataType": "System.Int32",
            "ColumnType": "int"
        },
        {
            "ColumnName": "RiskLevelDuringSignIn",
            "ColumnOrdinal": 28,
            "DataType": "System.Int32",
            "ColumnType": "int"
        },
        {
            "ColumnName": "RiskEventTypes",
            "ColumnOrdinal": 29,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "RiskState",
            "ColumnOrdinal": 30,
            "DataType": "System.Int32",
            "ColumnType": "int"
        },
        {
            "ColumnName": "UserAgent",
            "ColumnOrdinal": 31,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "ClientAppUsed",
            "ColumnOrdinal": 32,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "Browser",
            "ColumnOrdinal": 33,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "ConditionalAccessPolicies",
            "ColumnOrdinal": 34,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "ConditionalAccessStatus",
            "ColumnOrdinal": 35,
            "DataType": "System.Int32",
            "ColumnType": "int"
        },
        {
            "ColumnName": "IPAddress",
            "ColumnOrdinal": 36,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "Country",
            "ColumnOrdinal": 37,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "State",
            "ColumnOrdinal": 38,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "City",
            "ColumnOrdinal": 39,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "Latitude",
            "ColumnOrdinal": 40,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "Longitude",
            "ColumnOrdinal": 41,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "NetworkLocationDetails",
            "ColumnOrdinal": 42,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "RequestId",
            "ColumnOrdinal": 43,
            "DataType": "System.String",
            "ColumnType": "string"
        },
        {
            "ColumnName": "ReportId",
            "ColumnOrdinal": 44,
            "DataType": "System.String",
            "ColumnType": "string"
        }
    ]
}
```