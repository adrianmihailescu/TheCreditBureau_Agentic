# The Credit Bureau

A credit-flow prototype for customers, brokers, banks, a credit bureau, and their software agents. The workspace separates the React TypeScript frontend, ASP.NET Core API, SQL Server schema/seeds, agent definitions, and project documentation.

## Run the frontend

```powershell
cd frontend\credit-bureau-web
npm install
npm run dev
```

Run `npm run typecheck` and `npm run build` from that folder to validate the frontend.

## Run the demo API

With the .NET 10 SDK installed:

```powershell
dotnet run --project backend\CreditBureau.Api --urls http://localhost:5250
```

The API exposes `GET /health`, `GET /api/applications`, and `GET /api/applications/{id}`. It uses an in-memory repository and does not connect to SQL Server. The frontend currently reads its own local TypeScript fixtures rather than calling this API.

## Demo data and SQL

The frontend portfolio includes fictional customers, banks, brokers, applications, and sample credit-report indicators. All records use invented identifiers and `.test` email addresses. An application without consent has no demo report. Seed scripts are illustrative only and are not run automatically:

1. Apply `database\schema.sql` to an isolated SQL Server demo database.
2. Apply `database\seed.sql` to add fictional sample records.

## Agents and instructions

VS Code custom agents are in `.github\agents\`; Copilot coding guidance is in `.github\instructions\`. Agent role descriptions and workflow notes are under `agents\`.

## Prototype limitations

This project does not connect to a real credit bureau, send notifications, or make credit decisions. The sample credit indicators are fictional and must not be used to assess real applicants. Lending decisions belong to an authorized human credit officer.
