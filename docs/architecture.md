# Architecture

```text
frontend/credit-bureau-web  React + TypeScript demo UI; loads workflow data from the API
backend/CreditBureau.Api   ASP.NET Core API backed by SQL Server LocalDB
database/                  SQL Server schema and idempotent fictional seed records
agents/                    Role definitions and orchestration/runtime guidance
.github/                   VS Code custom agent profiles and Copilot instructions
```

Customer, institution, demo-account, application, report, workflow-setting, and audit-event data are loaded from and persisted to `TheCreditBureauDemo` on `(localdb)\MSSQLLocalDB`. Apply `database\schema.sql`, `database\procedures.sql`, and `database\seed.sql` in that order before starting the API. Application, report, workflow-setting, and audit writes run through transactional SQL Server procedures. The frontend does not contain application fixtures. The demo API does not connect to a real credit bureau.

The frontend applies role-specific presentation filters to data returned by the demo API. The API does not authenticate callers, so these filters and the demo role picker are not security boundaries. Production access control must be implemented and tested server-side.
