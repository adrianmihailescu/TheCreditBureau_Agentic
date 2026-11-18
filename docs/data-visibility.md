# Demo data visibility

The frontend applies least-privilege display rules based on the selected demo account:

| Demo role | Visible application data |
| --- | --- |
| Customer | Applications linked to that customer; product, requested amount, status, and consent indicator. |
| Broker | Applications linked to that broker; customer, bank, product, amount, status, and consent indicator. No report details. |
| Bank | Applications submitted to that bank; customer, product, amount, status, and consent indicator. No report score. |
| Credit Bureau | Consented requests only; application reference, product, report indicator, and consent. No customer name or requested amount. |
| Credit Officer | Applications for that officer's bank; customer, product, amount, status, consent, and a demo report score only when consent is recorded. |
| Administrator | Aggregate application, consent, and institution counts. No application rows or amounts. |
| Regulator / Auditor | Aggregate application, consent, and status counts. No customer identities, amounts, or report details. |

These are UI presentation rules for fictional data. Demo account records and application data are stored in SQL Server and returned by an unauthenticated demo API. Demo accounts are selectable without credentials, and client-side filtering does **not** provide security or enforce access control. Do not expose the demo API to untrusted networks or real applicant data. A real deployment must authenticate users and enforce authorization and data filtering on the server for every request.
