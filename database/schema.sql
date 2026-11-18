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
