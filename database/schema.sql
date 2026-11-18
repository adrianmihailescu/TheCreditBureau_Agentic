IF OBJECT_ID(N'dbo.Customers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Customers (
        Id NVARCHAR(32) NOT NULL PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Email NVARCHAR(160) NOT NULL
    );
END;
GO

IF OBJECT_ID(N'dbo.Banks', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Banks (
        Id NVARCHAR(32) NOT NULL PRIMARY KEY,
        Name NVARCHAR(120) NOT NULL,
        InstitutionType NVARCHAR(50) NOT NULL
    );
END;
GO

IF OBJECT_ID(N'dbo.Brokers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Brokers (
        Id NVARCHAR(32) NOT NULL PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Organization NVARCHAR(120) NOT NULL
    );
END;
GO

IF OBJECT_ID(N'dbo.Applications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Applications (
        Id NVARCHAR(32) NOT NULL PRIMARY KEY,
        CustomerId NVARCHAR(32) NOT NULL,
        BankId NVARCHAR(32) NOT NULL,
        BrokerId NVARCHAR(32) NOT NULL,
        Product NVARCHAR(80) NOT NULL,
        RequestedAmount DECIMAL(12, 2) NOT NULL,
        Status NVARCHAR(40) NOT NULL,
        SubmittedAt DATE NOT NULL,
        ConsentRecorded BIT NOT NULL,
        CONSTRAINT CK_Applications_RequestedAmount CHECK (RequestedAmount > 0),
        CONSTRAINT FK_Applications_Customers FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(Id),
        CONSTRAINT FK_Applications_Banks FOREIGN KEY (BankId) REFERENCES dbo.Banks(Id),
        CONSTRAINT FK_Applications_Brokers FOREIGN KEY (BrokerId) REFERENCES dbo.Brokers(Id)
    );
END;
GO

IF OBJECT_ID(N'dbo.CreditReports', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CreditReports (
        Id NVARCHAR(32) NOT NULL PRIMARY KEY,
        ApplicationId NVARCHAR(32) NOT NULL UNIQUE,
        GeneratedAt DATE NOT NULL,
        DemoScore INT NOT NULL,
        Summary NVARCHAR(240) NOT NULL,
        CONSTRAINT FK_CreditReports_Applications
            FOREIGN KEY (ApplicationId) REFERENCES dbo.Applications(Id)
    );
END;
GO

IF COL_LENGTH(N'dbo.Applications', N'DocumentsProvidedJson') IS NULL
BEGIN
    ALTER TABLE dbo.Applications
        ADD DocumentsProvidedJson NVARCHAR(MAX) NOT NULL
            CONSTRAINT DF_Applications_DocumentsProvidedJson DEFAULT N'[]';
END;
GO

IF COL_LENGTH(N'dbo.Applications', N'ReportPrepared') IS NULL
BEGIN
    ALTER TABLE dbo.Applications
        ADD ReportPrepared BIT NOT NULL
            CONSTRAINT DF_Applications_ReportPrepared DEFAULT (0);
END;
GO

IF OBJECT_ID(N'dbo.DemoAccounts', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DemoAccounts (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Role NVARCHAR(40) NOT NULL,
        Email NVARCHAR(160) NOT NULL,
        Organization NVARCHAR(120) NOT NULL,
        Action NVARCHAR(80) NOT NULL,
        ScopeId NVARCHAR(32) NULL,
        SortOrder INT NOT NULL
    );
END;
GO

IF OBJECT_ID(N'dbo.WorkflowSettings', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WorkflowSettings (
        Id INT NOT NULL PRIMARY KEY,
        MaximumApplicationAmount DECIMAL(12, 2) NOT NULL,
        BankExposureCap DECIMAL(12, 2) NOT NULL,
        RequireConsent BIT NOT NULL,
        RequiredDocumentsJson NVARCHAR(MAX) NOT NULL,
        CONSTRAINT CK_WorkflowSettings_Id CHECK (Id = 1),
        CONSTRAINT CK_WorkflowSettings_ApplicationAmount CHECK (MaximumApplicationAmount > 0),
        CONSTRAINT CK_WorkflowSettings_BankExposure CHECK (BankExposureCap > 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.AuditEvents', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuditEvents (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        OccurredAt DATETIMEOFFSET NOT NULL,
        ActorAccountId NVARCHAR(64) NOT NULL,
        ActorRole NVARCHAR(40) NOT NULL,
        ApplicationId NVARCHAR(32) NULL,
        Action NVARCHAR(160) NOT NULL,
        CONSTRAINT FK_AuditEvents_DemoAccounts
            FOREIGN KEY (ActorAccountId) REFERENCES dbo.DemoAccounts(Id),
        CONSTRAINT FK_AuditEvents_Applications
            FOREIGN KEY (ApplicationId) REFERENCES dbo.Applications(Id)
    );
END;
GO
