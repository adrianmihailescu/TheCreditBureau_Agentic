using System.ComponentModel.DataAnnotations;

namespace CreditBureau.Api.Application;

/// <summary>Represents a fictional customer stored in the demo database.</summary>
public sealed record DemoCustomerResponse(string Id, string Name, string Email);

/// <summary>Represents a participating fictional bank.</summary>
public sealed record DemoBankResponse(string Id, string Name, string Type);

/// <summary>Represents a fictional broker and organization.</summary>
public sealed record DemoBrokerResponse(string Id, string Name, string Organization);

/// <summary>Represents a selectable demo actor account.</summary>
public sealed record DemoAccountResponse(
    string Id,
    string Name,
    string Role,
    string Email,
    string Organization,
    string Action,
    string? ScopeId);

/// <summary>Represents a fictional bureau report associated with an application.</summary>
public sealed record DemoCreditReportResponse(
    string Id,
    string ApplicationId,
    DateOnly GeneratedAt,
    int DemoScore,
    string Summary);

/// <summary>Represents an application and its related demo records.</summary>
public sealed record DemoApplicationResponse(
    string Id,
    string CustomerId,
    string BankId,
    string BrokerId,
    string Product,
    decimal RequestedAmount,
    string Status,
    DateOnly SubmittedAt,
    bool ConsentRecorded,
    IReadOnlyList<string> DocumentsProvided,
    bool ReportPrepared,
    DemoCustomerResponse Customer,
    DemoBankResponse Bank,
    DemoBrokerResponse Broker,
    DemoCreditReportResponse? Report,
    IReadOnlyList<string> WorkflowSteps,
    int CurrentWorkflowStepIndex);

/// <summary>Represents persisted workflow configuration.</summary>
public sealed record DemoWorkflowLimitsResponse(
    decimal MaximumApplicationAmount,
    decimal BankExposureCap,
    bool RequireConsent,
    IReadOnlyList<string> RequiredDocuments,
    IReadOnlyList<string> WorkflowSteps);

/// <summary>Represents a privacy-minimized demo workflow audit event.</summary>
public sealed record DemoAuditEventResponse(
    int Id,
    DateTimeOffset OccurredAt,
    string ActorRole,
    string? ApplicationId,
    string Action);

/// <summary>Contains database-backed data required by the frontend demo.</summary>
public sealed record DemoStateResponse(
    IReadOnlyList<DemoCustomerResponse> Customers,
    IReadOnlyList<DemoBankResponse> Banks,
    IReadOnlyList<DemoBrokerResponse> Brokers,
    IReadOnlyList<DemoAccountResponse> Accounts,
    IReadOnlyList<DemoApplicationResponse> Applications,
    DemoWorkflowLimitsResponse Limits,
    IReadOnlyList<DemoAuditEventResponse> AuditEvents);

/// <summary>Payload for creating a customer credit application.</summary>
public sealed record CreateDemoApplicationRequest
{
    [Required, StringLength(64)]
    public required string CustomerAccountId { get; init; }

    [Required, StringLength(32)]
    public required string BankId { get; init; }

    [Required, StringLength(32)]
    public required string BrokerId { get; init; }

    [Required, StringLength(80)]
    public required string Product { get; init; }

    [Range(typeof(decimal), "0.01", "9999999999")]
    public required decimal RequestedAmount { get; init; }

    public required bool ConsentRecorded { get; init; }

    [Required]
    public required IReadOnlyList<string> DocumentsProvided { get; init; }
}

/// <summary>Payload for recording an approval or rejection for the current workflow step.</summary>
public sealed record RecordDemoWorkflowDecisionRequest
{
    [Required, StringLength(64)]
    public required string ActorAccountId { get; init; }

    [Required, RegularExpression("^(Approved|Rejected)$")]
    public required string Decision { get; init; }
}

/// <summary>Payload for changing persisted demo workflow settings.</summary>
public sealed record UpdateDemoWorkflowLimitsRequest
{
    [Required, StringLength(64)]
    public required string ActorAccountId { get; init; }

    [Range(typeof(decimal), "0.01", "9999999999")]
    public required decimal MaximumApplicationAmount { get; init; }

    [Range(typeof(decimal), "0.01", "9999999999")]
    public required decimal BankExposureCap { get; init; }

    public required bool RequireConsent { get; init; }

    [Required]
    public required IReadOnlyList<string> RequiredDocuments { get; init; }

    [Required]
    public required IReadOnlyList<string> WorkflowSteps { get; init; }
}

/// <summary>Confirms a persisted workflow action.</summary>
public sealed record DemoWorkflowActionResponse(
    bool Success,
    string Message,
    string? ApplicationId = null);
