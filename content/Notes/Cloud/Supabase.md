---
dg-publish: true
---
DBaaS like Firebase, seems like it has better defaults though. Similar anon/service_role keys. https://github.com/zernonia/supabase-schema is handy for visualizing the schema. #TODO write a Firebase-style mass scanner?

	Wrote a quick dumper:
```python
from supabase import create_client
import json
import requests
from pathlib import Path

SUPABASE_URL = "https://xyz.supabase.co"
SUPABASE_KEY = "";

client = create_client(SUPABASE_URL, SUPABASE_KEY)
schema: dict = requests.get(f"{SUPABASE_URL}/rest/v1/?apikey={SUPABASE_KEY}").json()
for definition in schema.get("definitions", {}).keys():
  data = client.table(definition).select('*').execute()
  if len(data.data) == 0:
    continue
  with open(Path.cwd() / f'{definition}.json', 'w') as f:
    f.write(json.dumps(data.data, indent=2))
```
