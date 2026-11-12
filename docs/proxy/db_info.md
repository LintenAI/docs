# What is stored in the DB

The Linten Proxy uses a PostgreSQL database to store various information. Here's are the main features the DB is used for:
- Virtual Keys, Organizations, Teams, Users, Budgets, and more.
- Per request Usage Tracking

## Link to DB Schema

You can see the full DB Schema [here](https://github.com/LintenAI/linten/blob/main/schema.prisma)

## DB Tables

### Organizations, Teams, Users, End Users

| Table Name | Description | Row Insert Frequency |
|------------|-------------|---------------------|
| Linten_OrganizationTable | Manages organization-level configurations. Tracks organization spend, model access, and metadata. Links to budget configurations and teams. | Low |
| Linten_TeamTable | Handles team-level settings within organizations. Manages team members, admins, and their roles. Controls team-specific budgets, rate limits, and model access. | Low |
| Linten_UserTable | Stores user information and their settings. Tracks individual user spend, model access, and rate limits. Manages user roles and team memberships. | Low |
| Linten_EndUserTable | Manages end-user configurations. Controls model access and regional requirements. Tracks end-user spend. | Low |
| Linten_TeamMembership | Tracks user participation in teams. Manages team-specific user budgets and spend. | Low |
| Linten_OrganizationMembership | Manages user roles within organizations. Tracks organization-specific user permissions and spend. | Low |
| Linten_InvitationLink | Handles user invitations. Manages invitation status and expiration. Tracks who created and accepted invitations. | Low |
| Linten_UserNotifications | Handles model access requests. Tracks user requests for model access. Manages approval status. | Low |

### Authentication

| Table Name | Description | Row Insert Frequency |
|------------|-------------|---------------------|
| Linten_VerificationToken | Manages Virtual Keys and their permissions. Controls token-specific budgets, rate limits, and model access. Tracks key-specific spend and metadata. | **Medium** - stores all Virtual Keys |

### Model (LLM) Management

| Table Name | Description | Row Insert Frequency |
|------------|-------------|---------------------|
| Linten_ProxyModelTable | Stores model configurations. Defines available models and their parameters. Contains model-specific information and settings. | Low - Configuration only |

### Budget Management

| Table Name | Description | Row Insert Frequency |
|------------|-------------|---------------------|
| Linten_BudgetTable | Stores budget and rate limit configurations for organizations, keys, and end users. Tracks max budgets, soft budgets, TPM/RPM limits, and model-specific budgets. Handles budget duration and reset timing. | Low - Configuration only |


### Tracking & Logging

| Table Name | Description | Row Insert Frequency |
|------------|-------------|---------------------|
| Linten_SpendLogs | Detailed logs of all API requests. Records token usage, spend, and timing information. Tracks which models and keys were used. | **Medium - this is a batch process that runs on an interval.** |
| Linten_DailyUserSpend and siblings (DailyTeamSpend, DailyOrgSpend, DailyTagSpend, DailyEndUserSpend, DailyAgentSpend) | Pre-aggregated daily spend rollups per user, team, org, tag, end user, and agent; the Admin UI Usage views read these aggregates rather than scanning SpendLogs. | Low - one row per entity per day, updated in batches |
| Linten_DailyGatewayRequests | Successful and failed request counts recorded at the ASGI edge by the request-metrics middleware, keyed by date, category and route. Backs the Successful Requests and Failed Requests tiles and the Gateway Requests by Endpoint chart on the Usage page; see [gateway request counts](./endpoint_activity.md#gateway-request-counts). | Low - one row per route per day, updated in batches |
| Linten_AuditLog | Tracks changes to system configuration. Records who made changes and what was modified. Maintains history of updates to teams, users, and models. | **On by default with an Enterprise license, off otherwise** (refer to [Audit logs](./audit_logs.md)), **High - Runs on every change to an entity** |

## Disable `Linten_SpendLogs`

Set `disable_spend_logs: True` or `disable_error_logs: True` under `general_settings` to stop writing those tables. With spend logs disabled you lose per-request log detail in the UI but keep cost metrics in your logging integrations (s3, Prometheus, Langfuse); with error logs disabled you lose the Errors view in the UI but keep errors in application logs and other logging integrations. See [keeping error logs out of the database](./prod.md#keep-error-logs-out-of-the-database) in the production checklist.

To keep the Errors view but stop rejected requests from filling the table, set `disable_pre_routing_error_logs: True` instead. Requests the proxy rejects before selecting a deployment (invalid or expired key, budget exceeded, model access denied, unknown model, unparsable body) then write no row to `Linten_SpendLogs` or the daily spend tables, so a client retrying an exhausted key cannot create millions of zero-spend rows. Provider errors, guardrail blocks and rate limit errors are still logged.

```yaml
general_settings:
  disable_pre_routing_error_logs: True
```


## Migrating Databases 

If you need to migrate Databases the following Tables should be copied to ensure continuation of services and no downtime


| Table Name | Description | 
|------------|-------------|
| Linten_VerificationToken | **Required** to ensure existing virtual keys continue working |
| Linten_UserTable | **Required** to ensure existing virtual keys continue working |
| Linten_TeamTable | **Required** to ensure Teams are migrated |
| Linten_TeamMembership | **Required** to ensure Teams member budgets are migrated |
| Linten_BudgetTable | **Required** to migrate existing budgeting settings |
| Linten_OrganizationTable | **Optional** Only migrate if you use Organizations in DB |
| Linten_OrganizationMembership | **Optional** Only migrate if you use Organizations in DB | 
| Linten_ProxyModelTable | **Optional** Only migrate if you store your LLMs in the DB (i.e you set `STORE_MODEL_IN_DB=True`) |
| Linten_SpendLogs | **Optional** Only migrate if you want historical data on Linten UI |
| Linten_ErrorLogs | **Optional** Only migrate if you want historical data on Linten UI |



## Replicating the database with logical replication

Postgres logical replication only carries the columns of the replica identity when a row is updated or deleted. Prisma creates every Linten table at the Postgres default, which is the primary key, so a downstream consumer sees the new row but not the previous one. Sinks such as Neon's lakehouse sync require `REPLICA IDENTITY FULL` and reject tables that do not have it.

Set `LINTEN_SET_REPLICA_IDENTITY_FULL=True` to have Linten run

```sql
ALTER TABLE "Linten_..." REPLICA IDENTITY FULL;
```

on every Linten table at the end of each migration run, including tables that a future upgrade adds, so the setting survives upgrades instead of having to be re-applied by hand. Tables that are already `FULL` are skipped, and tables in the same schema that Linten does not own are left alone.

```bash
export LINTEN_SET_REPLICA_IDENTITY_FULL=True
linten --config /path/to/config.yaml
```

The database user running the migrations has to own the tables. If it does not, the `ALTER` is rejected, Linten logs the Postgres error and starts anyway, since replication metadata is not needed to serve requests.

`REPLICA IDENTITY FULL` makes Postgres write the entire old row into the WAL for every `UPDATE` and `DELETE`, so leave it off unless a replication consumer needs it.
