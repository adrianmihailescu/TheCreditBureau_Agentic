# Business workflow

1. A customer submits an application, records consent, and marks which documents are provided.
2. A broker routes eligible applications to the selected bank.
3. The bank checks configured caps and required documents, then requests a bureau report when consent is recorded.
4. The bureau prepares a fictional report only for a consented request.
5. A Credit Officer manually records an approval or rejection. Other actors and software agents cannot make the final decision.
6. The Administrator configures demo limits and requirements; the Regulator / Auditor can review a privacy-minimized event list.

The prototype persists workflow actions and settings in the SQL Server demo database through the ASP.NET API. A limit or missing prerequisite blocks a handoff without automatically rejecting an application. Demo statuses, report samples, and risk indicators are invented and must not be used for real credit decisions.
