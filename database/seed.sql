-- Fictional demo records only. Safe to run repeatedly against the matching schema.
IF NOT EXISTS (SELECT 1 FROM dbo.Customers WHERE Id = N'CUS-1001')
    INSERT INTO dbo.Customers (Id, Name, Email)
    VALUES (N'CUS-1001', N'Jordan Lee', N'jordan.lee@example.test');
IF NOT EXISTS (SELECT 1 FROM dbo.Customers WHERE Id = N'CUS-1002')
    INSERT INTO dbo.Customers (Id, Name, Email)
    VALUES (N'CUS-1002', N'Taylor Morgan', N'taylor.morgan@example.test');
IF NOT EXISTS (SELECT 1 FROM dbo.Customers WHERE Id = N'CUS-1003')
    INSERT INTO dbo.Customers (Id, Name, Email)
    VALUES (N'CUS-1003', N'Casey Rivera', N'casey.rivera@example.test');
IF NOT EXISTS (SELECT 1 FROM dbo.Customers WHERE Id = N'CUS-1004')
    INSERT INTO dbo.Customers (Id, Name, Email)
    VALUES (N'CUS-1004', N'Riley Chen', N'riley.chen@example.test');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Banks WHERE Id = N'BNK-101')
    INSERT INTO dbo.Banks (Id, Name, InstitutionType)
    VALUES (N'BNK-101', N'Northstar Community Bank', N'Community bank');
IF NOT EXISTS (SELECT 1 FROM dbo.Banks WHERE Id = N'BNK-102')
    INSERT INTO dbo.Banks (Id, Name, InstitutionType)
    VALUES (N'BNK-102', N'Harborline Credit Union', N'Credit union');
IF NOT EXISTS (SELECT 1 FROM dbo.Banks WHERE Id = N'BNK-103')
    INSERT INTO dbo.Banks (Id, Name, InstitutionType)
    VALUES (N'BNK-103', N'Cedar & Stone Bank', N'Retail bank');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Brokers WHERE Id = N'BRK-201')
    INSERT INTO dbo.Brokers (Id, Name, Organization)
    VALUES (N'BRK-201', N'Avery Brooks', N'Bridgeway Finance');
IF NOT EXISTS (SELECT 1 FROM dbo.Brokers WHERE Id = N'BRK-202')
    INSERT INTO dbo.Brokers (Id, Name, Organization)
    VALUES (N'BRK-202', N'Quinn Davis', N'CommonGround Advisors');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Applications WHERE Id = N'APP-2026-001')
    INSERT INTO dbo.Applications
        (Id, CustomerId, BankId, BrokerId, Product, RequestedAmount, Status, SubmittedAt, ConsentRecorded)
    VALUES
        (N'APP-2026-001', N'CUS-1001', N'BNK-101', N'BRK-201', N'Personal loan', 12500, N'In review', '2026-11-17', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Applications WHERE Id = N'APP-2026-002')
    INSERT INTO dbo.Applications
        (Id, CustomerId, BankId, BrokerId, Product, RequestedAmount, Status, SubmittedAt, ConsentRecorded)
    VALUES
        (N'APP-2026-002', N'CUS-1002', N'BNK-102', N'BRK-202', N'Auto loan', 28600, N'Documents needed', '2026-11-16', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Applications WHERE Id = N'APP-2026-003')
    INSERT INTO dbo.Applications
        (Id, CustomerId, BankId, BrokerId, Product, RequestedAmount, Status, SubmittedAt, ConsentRecorded)
    VALUES
        (N'APP-2026-003', N'CUS-1003', N'BNK-103', N'BRK-201', N'Small business loan', 42000, N'Awaiting officer', '2026-11-14', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Applications WHERE Id = N'APP-2026-004')
    INSERT INTO dbo.Applications
        (Id, CustomerId, BankId, BrokerId, Product, RequestedAmount, Status, SubmittedAt, ConsentRecorded)
    VALUES
        (N'APP-2026-004', N'CUS-1004', N'BNK-101', N'BRK-202', N'Personal loan', 8000, N'Consent required', '2026-11-12', 0);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.CreditReports WHERE Id = N'RPT-DEMO-001')
    INSERT INTO dbo.CreditReports (Id, ApplicationId, GeneratedAt, DemoScore, Summary)
    VALUES (N'RPT-DEMO-001', N'APP-2026-001', '2026-11-17', 721,
        N'Fictional report; sample data only. Human review required.');
IF NOT EXISTS (SELECT 1 FROM dbo.CreditReports WHERE Id = N'RPT-DEMO-002')
    INSERT INTO dbo.CreditReports (Id, ApplicationId, GeneratedAt, DemoScore, Summary)
    VALUES (N'RPT-DEMO-002', N'APP-2026-002', '2026-11-16', 684,
        N'Fictional report; sample data only. Human review required.');
IF NOT EXISTS (SELECT 1 FROM dbo.CreditReports WHERE Id = N'RPT-DEMO-003')
    INSERT INTO dbo.CreditReports (Id, ApplicationId, GeneratedAt, DemoScore, Summary)
    VALUES (N'RPT-DEMO-003', N'APP-2026-003', '2026-11-14', 748,
        N'Fictional report; sample data only. Human review required.');
GO

UPDATE dbo.Applications
SET Status = CASE Status
        WHEN N'In review' THEN N'Awaiting officer'
        WHEN N'Documents needed' THEN N'Bank review'
        WHEN N'Consent required' THEN N'Submitted'
        ELSE Status
    END,
    DocumentsProvidedJson = CASE
        WHEN Id = N'APP-2026-001' AND DocumentsProvidedJson = N'[]'
            THEN N'["Proof of identity","Proof of income"]'
        WHEN Id = N'APP-2026-003'
             AND DocumentsProvidedJson = N'[]'
            THEN N'["Proof of identity","Proof of income","Business registration"]'
        WHEN Id = N'APP-2026-002' AND DocumentsProvidedJson = N'[]'
            THEN N'["Proof of identity"]'
        ELSE DocumentsProvidedJson
    END
WHERE Id IN (N'APP-2026-001', N'APP-2026-002', N'APP-2026-003', N'APP-2026-004');
GO

UPDATE dbo.Applications
SET CurrentWorkflowStepIndex = CASE Status
    WHEN N'Bank review' THEN 1
    WHEN N'Awaiting bureau report' THEN 2
    WHEN N'Awaiting officer' THEN 3
    WHEN N'Approved' THEN 4
    WHEN N'Rejected' THEN 4
    ELSE 0
END
WHERE Id IN (N'APP-2026-001', N'APP-2026-002', N'APP-2026-003', N'APP-2026-004');
GO

UPDATE a
SET ReportPrepared = 1
FROM dbo.Applications AS a
WHERE EXISTS (
    SELECT 1
    FROM dbo.CreditReports AS report
    WHERE report.ApplicationId = a.Id
);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.DemoAccounts WHERE Id = N'demo-customer')
    INSERT INTO dbo.DemoAccounts (Id, Name, Role, Email, Organization, Action, ScopeId, SortOrder)
    VALUES (N'demo-customer', N'Demo Customer', N'Customer', N'jordan.lee@example.test',
        N'Individual applicant', N'Start application', N'CUS-1001', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.DemoAccounts WHERE Id = N'demo-broker')
    INSERT INTO dbo.DemoAccounts (Id, Name, Role, Email, Organization, Action, ScopeId, SortOrder)
    VALUES (N'demo-broker', N'Demo Broker', N'Broker', N'avery.brooks@example.test',
        N'Bridgeway Finance', N'Submit to a bank', N'BRK-201', 2);
IF NOT EXISTS (SELECT 1 FROM dbo.DemoAccounts WHERE Id = N'demo-bank')
    INSERT INTO dbo.DemoAccounts (Id, Name, Role, Email, Organization, Action, ScopeId, SortOrder)
    VALUES (N'demo-bank', N'demo bank', N'Bank', N'morgan.ellis@northstar.example.test',
        N'Northstar Community Bank', N'Start bank review', N'BNK-101', 3);
IF NOT EXISTS (SELECT 1 FROM dbo.DemoAccounts WHERE Id = N'demo-bureau')
    INSERT INTO dbo.DemoAccounts (Id, Name, Role, Email, Organization, Action, ScopeId, SortOrder)
    VALUES (N'demo-bureau', N'demo bureau', N'Credit Bureau', N'jamie.park@bureau.example.test',
        N'The Credit Bureau', N'Prepare demo report', NULL, 4);
IF NOT EXISTS (SELECT 1 FROM dbo.DemoAccounts WHERE Id = N'demo-credit-officer')
    INSERT INTO dbo.DemoAccounts (Id, Name, Role, Email, Organization, Action, ScopeId, SortOrder)
    VALUES (N'demo-credit-officer', N'demo credit officer', N'Credit Officer',
        N'dana.scott@northstar.example.test', N'Northstar Community Bank',
        N'Start officer review', N'BNK-101', 5);
IF NOT EXISTS (SELECT 1 FROM dbo.DemoAccounts WHERE Id = N'demo-administrator')
    INSERT INTO dbo.DemoAccounts (Id, Name, Role, Email, Organization, Action, ScopeId, SortOrder)
    VALUES (N'demo-administrator', N'demo administrator', N'Administrator',
        N'sam.taylor@example.test', N'Platform administration',
        N'Run workflow demo', NULL, 6);
IF NOT EXISTS (SELECT 1 FROM dbo.DemoAccounts WHERE Id = N'demo-auditor')
    INSERT INTO dbo.DemoAccounts (Id, Name, Role, Email, Organization, Action, ScopeId, SortOrder)
    VALUES (N'demo-auditor', N'demo auditor', N'Regulator / Auditor',
        N'alex.morgan@oversight.example.test', N'Oversight team',
        N'Start audit review', NULL, 7);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.WorkflowSettings WHERE Id = 1)
    INSERT INTO dbo.WorkflowSettings
        (Id, MaximumApplicationAmount, BankExposureCap, RequireConsent,
         RequiredDocumentsJson, WorkflowStepsJson)
    VALUES
        (1, 50000, 150000, 1, N'["Proof of identity","Proof of income"]',
         N'["Broker","Bank","Credit Bureau","Credit Officer"]');
GO
