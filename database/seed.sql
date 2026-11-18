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
