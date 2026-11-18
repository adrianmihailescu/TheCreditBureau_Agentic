---
applyTo: "**"
---

# Architecture

- Keep the React/TypeScript frontend under `frontend/credit-bureau-web`.
- Keep API behavior in `backend/CreditBureau.Api`; separate domain, application, infrastructure, controllers, and persistence concerns.
- Keep agent role definitions in `agents/definitions` and VS Code custom agents in `.github/agents`.
- Treat SQL schema and seed scripts as the database contract; update both when the demo entities change.
- Clearly identify in-memory repositories and sample datasets as prototypes, not production integrations.
