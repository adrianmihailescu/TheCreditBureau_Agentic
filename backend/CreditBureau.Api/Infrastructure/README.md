# Infrastructure

The API uses `Microsoft.Data.SqlClient` to persist demo participants, applications, workflow settings, bureau reports, and audit events in the configured SQL Server database. The default local connection targets `(localdb)\MSSQLLocalDB` and `TheCreditBureauDemo`. Set `ConnectionStrings__CreditBureau` to override it.

The API is a local demo and has no authentication. Do not expose it to untrusted networks or use real applicant data.
