# Architecture

```text
frontend/credit-bureau-web  React + TypeScript demo UI and fictional fixtures
backend/CreditBureau.Api   ASP.NET Core API with an in-memory demo repository
database/                  SQL Server schema and idempotent fictional seed records
agents/                    Role definitions and orchestration/runtime guidance
.github/                   VS Code custom agent profiles and Copilot instructions
```

The frontend demo reads local TypeScript fixtures. The API independently exposes an in-memory sample application list. Neither is connected to SQL Server or an external credit bureau. SQL scripts describe a future persistence shape; they are not automatically applied.
