---
applyTo: "backend/**/*.cs"
---

# Backend guidance

- Keep controllers thin and put use-case behavior in the application layer.
- Validate inputs and return explicit, appropriate HTTP status codes.
- Do not log, expose, or persist secrets or unnecessary personal/credit information.
- Keep prototype data visibly fictional; do not imply that in-memory storage is durable.
- Lending decisions remain with an authorized human credit officer.
