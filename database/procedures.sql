CREATE OR ALTER PROCEDURE dbo.CreateDemoApplication
    @ApplicationId NVARCHAR(32),
    @CustomerId NVARCHAR(32),
    @BankId NVARCHAR(32),
    @BrokerId NVARCHAR(32),
    @Product NVARCHAR(80),
    @RequestedAmount DECIMAL(12, 2),
    @SubmittedAt DATE,
    @ConsentRecorded BIT,
    @DocumentsProvidedJson NVARCHAR(MAX),
    @CustomerAccountId NVARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO dbo.Applications
            (Id, CustomerId, BankId, BrokerId, Product, RequestedAmount, Status,
             SubmittedAt, ConsentRecorded, DocumentsProvidedJson, ReportPrepared)
        VALUES
            (@ApplicationId, @CustomerId, @BankId, @BrokerId, @Product, @RequestedAmount,
             N'Submitted', @SubmittedAt, @ConsentRecorded, @DocumentsProvidedJson, 0);

        INSERT INTO dbo.AuditEvents
            (OccurredAt, ActorAccountId, ActorRole, ApplicationId, Action)
        SELECT
            TODATETIMEOFFSET(SYSUTCDATETIME(), '+00:00'), Id, Role, @ApplicationId,
            N'Application submitted'
        FROM dbo.DemoAccounts
        WHERE Id = @CustomerAccountId
          AND Role = N'Customer'
          AND ScopeId = @CustomerId;

        IF @@ROWCOUNT <> 1
            THROW 51001, 'The customer demo account is invalid for this application.', 1;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.AdvanceDemoApplication
    @ApplicationId NVARCHAR(32),
    @ExpectedStatus NVARCHAR(40),
    @NextStatus NVARCHAR(40),
    @ActorAccountId NVARCHAR(64),
    @Action NVARCHAR(160),
    @PrepareReport BIT,
    @Updated BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET @Updated = 0;

    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE dbo.Applications
        SET Status = @NextStatus,
            ReportPrepared = CASE WHEN @PrepareReport = 1 THEN 1 ELSE ReportPrepared END
        WHERE Id = @ApplicationId
          AND Status = @ExpectedStatus;

        IF @@ROWCOUNT <> 1
        BEGIN
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        IF @PrepareReport = 1
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM dbo.Applications
                WHERE Id = @ApplicationId AND ConsentRecorded = 1
            )
                THROW 51002, 'A consented application is required to prepare a report.', 1;

            INSERT INTO dbo.CreditReports
                (Id, ApplicationId, GeneratedAt, DemoScore, Summary)
            VALUES
                (N'RPT-DEMO-' + LEFT(REPLACE(CONVERT(NVARCHAR(36), NEWID()), N'-', N''), 9),
                 @ApplicationId, CONVERT(DATE, SYSUTCDATETIME()), 701,
                 N'Fictional report; sample data only. Human review required.');
        END;

        INSERT INTO dbo.AuditEvents
            (OccurredAt, ActorAccountId, ActorRole, ApplicationId, Action)
        SELECT
            TODATETIMEOFFSET(SYSUTCDATETIME(), '+00:00'), Id, Role, @ApplicationId, @Action
        FROM dbo.DemoAccounts
        WHERE Id = @ActorAccountId;

        IF @@ROWCOUNT <> 1
            THROW 51003, 'The demo actor account does not exist.', 1;

        COMMIT TRANSACTION;
        SET @Updated = 1;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.UpdateDemoWorkflowSettings
    @ActorAccountId NVARCHAR(64),
    @MaximumApplicationAmount DECIMAL(12, 2),
    @BankExposureCap DECIMAL(12, 2),
    @RequireConsent BIT,
    @RequiredDocumentsJson NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE dbo.WorkflowSettings
        SET MaximumApplicationAmount = @MaximumApplicationAmount,
            BankExposureCap = @BankExposureCap,
            RequireConsent = @RequireConsent,
            RequiredDocumentsJson = @RequiredDocumentsJson
        WHERE Id = 1;

        IF @@ROWCOUNT <> 1
            THROW 51004, 'Demo workflow settings are not initialized in the database.', 1;

        INSERT INTO dbo.AuditEvents
            (OccurredAt, ActorAccountId, ActorRole, ApplicationId, Action)
        SELECT
            TODATETIMEOFFSET(SYSUTCDATETIME(), '+00:00'), Id, Role, NULL,
            N'Updated demo workflow limits'
        FROM dbo.DemoAccounts
        WHERE Id = @ActorAccountId
          AND Role = N'Administrator';

        IF @@ROWCOUNT <> 1
            THROW 51005, 'An administrator demo account is required.', 1;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
