---
{"dg-publish":true,"permalink":"/cloud/fleet/","updated":"2024-07-15T00:14:20.067+10:00"}
---

Open-source MDM based on osquery. Can forward logs to common event buses like Kafka, so maybe it could forward to [[Microsoft/Azure/Data Explorer\|Data Explorer]] or Clickhouse?
The Helm chart creates a job for automatic migrations, but doesn't delete it so migrations don't apply on upgrades without manually deleting the job.
#TODO add [ttlafterfinished](https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/) to the [template](https://github.com/fleetdm/fleet/pull/3827/files)

