using System.Data;
using System.Text.Json;
using CreditBureau.Api.Application;
using Microsoft.Data.SqlClient;

namespace CreditBureau.Api.Persistence;

public sealed class SqlDemoWorkflowRepository(string connectionString) : IDemoWorkflowRepository
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<DemoStateResponse> GetStateAsync(CancellationToken cancellationToken)
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);

        var customers = await ReadCustomersAsync(connection, cancellationToken);
        var banks = await ReadBanksAsync(connection, cancellationToken);
        var brokers = await ReadBrokersAsync(connection, cancellationToken);
        var accounts = await ReadAccountsAsync(connection, cancellationToken);
        var applications = await ReadApplicationsAsync(connection, cancellationToken);
        var limits = await ReadLimitsAsync(connection, cancellationToken);
        var auditEvents = await ReadAuditEventsAsync(connection, cancellationToken);

        return new DemoStateResponse(
            customers,
            banks,
            brokers,
            accounts,
            applications,
            limits,
            auditEvents);
    }

    public async Task CreateApplicationAsync(
        string applicationId,
        string customerId,
        CreateDemoApplicationRequest request,
        CancellationToken cancellationToken)
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand("dbo.CreateDemoApplication", connection)
        {
            CommandType = CommandType.StoredProcedure
        };
        command.Parameters.Add("@ApplicationId", SqlDbType.NVarChar, 32).Value = applicationId;
        command.Parameters.Add("@CustomerId", SqlDbType.NVarChar, 32).Value = customerId;
        command.Parameters.Add("@BankId", SqlDbType.NVarChar, 32).Value = request.BankId;
        command.Parameters.Add("@BrokerId", SqlDbType.NVarChar, 32).Value = request.BrokerId;
        command.Parameters.Add("@Product", SqlDbType.NVarChar, 80).Value = request.Product;
        command.Parameters.Add(new SqlParameter("@RequestedAmount", SqlDbType.Decimal)
        {
            Precision = 12,
            Scale = 2,
            Value = request.RequestedAmount
        });
        command.Parameters.Add("@SubmittedAt", SqlDbType.Date).Value = DateTime.UtcNow.Date;
        command.Parameters.Add("@ConsentRecorded", SqlDbType.Bit).Value = request.ConsentRecorded;
        command.Parameters.Add("@DocumentsProvidedJson", SqlDbType.NVarChar, -1).Value =
            JsonSerializer.Serialize(request.DocumentsProvided, JsonOptions);
        command.Parameters.Add("@CustomerAccountId", SqlDbType.NVarChar, 64).Value =
            request.CustomerAccountId;
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task<bool> TryTransitionApplicationAsync(
        string applicationId,
        string expectedStatus,
        int expectedStepIndex,
        string expectedActorRole,
        string nextStatus,
        int nextStepIndex,
        string actorAccountId,
        string action,
        bool prepareReport,
        CancellationToken cancellationToken)
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand("dbo.AdvanceDemoApplication", connection)
        {
            CommandType = CommandType.StoredProcedure
        };
        command.Parameters.Add("@ApplicationId", SqlDbType.NVarChar, 32).Value = applicationId;
        command.Parameters.Add("@ExpectedStatus", SqlDbType.NVarChar, 40).Value = expectedStatus;
        command.Parameters.Add("@ExpectedStepIndex", SqlDbType.Int).Value = expectedStepIndex;
        command.Parameters.Add("@ExpectedActorRole", SqlDbType.NVarChar, 40).Value = expectedActorRole;
        command.Parameters.Add("@NextStatus", SqlDbType.NVarChar, 40).Value = nextStatus;
        command.Parameters.Add("@NextStepIndex", SqlDbType.Int).Value = nextStepIndex;
        command.Parameters.Add("@ActorAccountId", SqlDbType.NVarChar, 64).Value = actorAccountId;
        command.Parameters.Add("@Action", SqlDbType.NVarChar, 160).Value = action;
        command.Parameters.Add("@PrepareReport", SqlDbType.Bit).Value = prepareReport;
        var updatedParameter = command.Parameters.Add("@Updated", SqlDbType.Bit);
        updatedParameter.Direction = ParameterDirection.Output;

        await command.ExecuteNonQueryAsync(cancellationToken);
        return updatedParameter.Value is bool updated && updated;
    }

    public async Task UpdateLimitsAsync(
        string actorAccountId,
        UpdateDemoWorkflowLimitsRequest request,
        CancellationToken cancellationToken)
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand("dbo.UpdateDemoWorkflowSettings", connection)
        {
            CommandType = CommandType.StoredProcedure
        };
        command.Parameters.Add("@ActorAccountId", SqlDbType.NVarChar, 64).Value = actorAccountId;
        command.Parameters.Add(new SqlParameter("@MaximumApplicationAmount", SqlDbType.Decimal)
        {
            Precision = 12,
            Scale = 2,
            Value = request.MaximumApplicationAmount
        });
        command.Parameters.Add(new SqlParameter("@BankExposureCap", SqlDbType.Decimal)
        {
            Precision = 12,
            Scale = 2,
            Value = request.BankExposureCap
        });
        command.Parameters.Add("@RequireConsent", SqlDbType.Bit).Value = request.RequireConsent;
        command.Parameters.Add("@RequiredDocumentsJson", SqlDbType.NVarChar, -1).Value =
            JsonSerializer.Serialize(request.RequiredDocuments, JsonOptions);
        command.Parameters.Add("@WorkflowStepsJson", SqlDbType.NVarChar, -1).Value =
            JsonSerializer.Serialize(request.WorkflowSteps, JsonOptions);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static async Task<IReadOnlyList<DemoCustomerResponse>> ReadCustomersAsync(
        SqlConnection connection,
        CancellationToken cancellationToken)
    {
        const string sql = "SELECT Id, Name, Email FROM dbo.Customers ORDER BY Id;";
        await using var command = new SqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<DemoCustomerResponse>();
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(new(reader.GetString(0), reader.GetString(1), reader.GetString(2)));
        }
        return items;
    }

    private static async Task<IReadOnlyList<DemoBankResponse>> ReadBanksAsync(
        SqlConnection connection,
        CancellationToken cancellationToken)
    {
        const string sql = "SELECT Id, Name, InstitutionType FROM dbo.Banks ORDER BY Id;";
        await using var command = new SqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<DemoBankResponse>();
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(new(reader.GetString(0), reader.GetString(1), reader.GetString(2)));
        }
        return items;
    }

    private static async Task<IReadOnlyList<DemoBrokerResponse>> ReadBrokersAsync(
        SqlConnection connection,
        CancellationToken cancellationToken)
    {
        const string sql = "SELECT Id, Name, Organization FROM dbo.Brokers ORDER BY Id;";
        await using var command = new SqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<DemoBrokerResponse>();
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(new(reader.GetString(0), reader.GetString(1), reader.GetString(2)));
        }
        return items;
    }

    private static async Task<IReadOnlyList<DemoAccountResponse>> ReadAccountsAsync(
        SqlConnection connection,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT Id, Name, Role, Email, Organization, Action, ScopeId
            FROM dbo.DemoAccounts
            ORDER BY SortOrder;
            """;
        await using var command = new SqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<DemoAccountResponse>();
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(new(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4),
                reader.GetString(5),
                reader.IsDBNull(6) ? null : reader.GetString(6)));
        }
        return items;
    }

    private static async Task<IReadOnlyList<DemoApplicationResponse>> ReadApplicationsAsync(
        SqlConnection connection,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT a.Id, a.CustomerId, a.BankId, a.BrokerId, a.Product, a.RequestedAmount,
                   a.Status, a.SubmittedAt, a.ConsentRecorded, a.DocumentsProvidedJson,
                   a.ReportPrepared,
                   c.Id, c.Name, c.Email,
                   b.Id, b.Name, b.InstitutionType,
                   br.Id, br.Name, br.Organization,
                   r.Id, r.ApplicationId, r.GeneratedAt, r.DemoScore, r.Summary,
                   a.WorkflowStepsJson, a.CurrentWorkflowStepIndex
            FROM dbo.Applications AS a
            INNER JOIN dbo.Customers AS c ON c.Id = a.CustomerId
            INNER JOIN dbo.Banks AS b ON b.Id = a.BankId
            INNER JOIN dbo.Brokers AS br ON br.Id = a.BrokerId
            LEFT JOIN dbo.CreditReports AS r
                ON r.ApplicationId = a.Id AND a.ConsentRecorded = 1
            ORDER BY a.SubmittedAt DESC, a.Id;
            """;
        await using var command = new SqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<DemoApplicationResponse>();
        while (await reader.ReadAsync(cancellationToken))
        {
            var documentsJson = reader.GetString(9);
            var documents = JsonSerializer.Deserialize<string[]>(documentsJson, JsonOptions)
                ?? throw new InvalidOperationException($"Application {reader.GetString(0)} has invalid document data.");
            var report = reader.IsDBNull(20)
                ? null
                : new DemoCreditReportResponse(
                    reader.GetString(20),
                    reader.GetString(21),
                    DateOnly.FromDateTime(reader.GetDateTime(22)),
                    reader.GetInt32(23),
                    reader.GetString(24));
            var workflowSteps = JsonSerializer.Deserialize<string[]>(reader.GetString(25), JsonOptions)
                ?? throw new InvalidOperationException($"Application {reader.GetString(0)} has invalid workflow steps.");

            items.Add(new(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4),
                reader.GetDecimal(5),
                reader.GetString(6),
                DateOnly.FromDateTime(reader.GetDateTime(7)),
                reader.GetBoolean(8),
                documents,
                reader.GetBoolean(10),
                new(reader.GetString(11), reader.GetString(12), reader.GetString(13)),
                new(reader.GetString(14), reader.GetString(15), reader.GetString(16)),
                new(reader.GetString(17), reader.GetString(18), reader.GetString(19)),
                report,
                workflowSteps,
                reader.GetInt32(26)));
        }
        return items;
    }

    private static async Task<DemoWorkflowLimitsResponse> ReadLimitsAsync(
        SqlConnection connection,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT MaximumApplicationAmount, BankExposureCap, RequireConsent,
                   RequiredDocumentsJson, WorkflowStepsJson
            FROM dbo.WorkflowSettings
            WHERE Id = 1;
            """;
        await using var command = new SqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            throw new InvalidOperationException("Demo workflow settings are not initialized in the database.");
        }

        var requiredDocuments = JsonSerializer.Deserialize<string[]>(reader.GetString(3), JsonOptions)
            ?? throw new InvalidOperationException("Demo workflow settings contain invalid document data.");
        var workflowSteps = JsonSerializer.Deserialize<string[]>(reader.GetString(4), JsonOptions)
            ?? throw new InvalidOperationException("Demo workflow settings contain invalid workflow steps.");
        return new(
            reader.GetDecimal(0),
            reader.GetDecimal(1),
            reader.GetBoolean(2),
            requiredDocuments,
            workflowSteps);
    }

    private static async Task<IReadOnlyList<DemoAuditEventResponse>> ReadAuditEventsAsync(
        SqlConnection connection,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT TOP (500) Id, OccurredAt, ActorRole, ApplicationId, Action
            FROM dbo.AuditEvents
            ORDER BY Id DESC;
            """;
        await using var command = new SqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<DemoAuditEventResponse>();
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(new(
                reader.GetInt32(0),
                reader.GetDateTimeOffset(1),
                reader.GetString(2),
                reader.IsDBNull(3) ? null : reader.GetString(3),
                reader.GetString(4)));
        }
        return items;
    }

}
