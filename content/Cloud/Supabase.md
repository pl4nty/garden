---
dg-publish: true
---
DBaaS like Firebase, seems like it has better defaults though. Similar anon/service_role keys. Can dump the schema with https://github.com/zernonia/supabase-schema and query with python. #TODO write a Firebase-style mass scanner?

```python
from supabase import create_client
import json
import requests

client = create_client("https://rgrfoqefycpwtyokrmzx.supabase.co", "<key>")
data = client.table('decks').select('*').execute()
json_output = json.dumps(data.data, indent=2)
with open('supadump.json', 'w') as f:
    f.write(json_output)
```
