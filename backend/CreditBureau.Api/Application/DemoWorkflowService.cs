namespace CreditBureau.Api.Application;

public sealed class DemoWorkflowService(IDemoWorkflowRepository repository) : IDemoWorkflowService
{
    private static readonly HashSet<string> KnownDocuments = new(
        ["Proof of identity", "Proof of income", "Business registration"],
        StringComparer.Ordinal);

    public Task<DemoStateResponse> GetStateAsync(CancellationToken cancellationToken) =>
        repository.GetStateAsync(cancellationToken);

    public async Task<DemoApplicationResponse?> GetApplicationAsync(
        string id,
        CancellationToken cancellationToken)
    {
        var state = await repository.GetStateAsync(cancellationToken);
        return state.Applications.FirstOrDefault(application =>
            string.Equals(application.Id, id, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<DemoActionOutcome> CreateApplicationAsync(
        CreateDemoApplicationRequest request,
        CancellationToken cancellationToken)
    {
        var state = await repository.GetStateAsync(cancellationToken);
        var account = state.Accounts.FirstOrDefault(item => item.Id == request.CustomerAccountId);
        if (account is null || account.Role != "Customer" || string.IsNullOrWhiteSpace(account.ScopeId))
        {
            return Failure(StatusCodes.Status403Forbidden, "A customer demo account is required.");
        }

        if (!state.Banks.Any(bank => bank.Id == request.BankId) ||
            !state.Brokers.Any(broker => broker.Id == request.BrokerId))
        {
            return Failure(StatusCodes.Status400BadRequest, "Choose a participating bank and broker.");
        }

        if (request.DocumentsProvided.Any(document => !KnownDocuments.Contains(document)))
        {
            return Failure(StatusCodes.Status400BadRequest, "The application includes an unknown document type.");
        }

        var id = $"APP-{DateTime.UtcNow:yyyy}-{Guid.NewGuid():N}"[..18];
        await repository.CreateApplicationAsync(
            id,
            account.ScopeId,
            request,
            cancellationToken);
        return new(
            StatusCodes.Status201Created,
            new(true, $"Application {id} submitted to the broker queue.", id));
    }

    public Task<DemoActionOutcome> RouteToBankAsync(
        string id,
        DemoActorRequest request,
        CancellationToken cancellationToken) =>
        TransitionAsync(
            id,
            request.ActorAccountId,
            "Broker",
            "Submitted",
            "Bank review",
            "Routed to bank",
            prepareReport: false,
            requireReport: false,
            cancellationToken);

    public Task<DemoActionOutcome> RequestBureauReportAsync(
        string id,
        DemoActorRequest request,
        CancellationToken cancellationToken) =>
        TransitionAsync(
            id,
            request.ActorAccountId,
            "Bank",
            "Bank review",
            "Awaiting bureau report",
            "Requested consented demo bureau report",
            prepareReport: false,
            requireReport: false,
            cancellationToken,
            requireConsent: true);

    public Task<DemoActionOutcome> SendToOfficerAsync(
        string id,
        DemoActorRequest request,
        CancellationToken cancellationToken) =>
        TransitionAsync(
            id,
            request.ActorAccountId,
            "Bank",
            "Bank review",
            "Awaiting officer",
            "Sent to Credit Officer",
            prepareReport: false,
            requireReport: true,
            cancellationToken);

    public Task<DemoActionOutcome> PrepareBureauReportAsync(
        string id,
        DemoActorRequest request,
        CancellationToken cancellationToken) =>
        TransitionAsync(
            id,
            request.ActorAccountId,
            "Credit Bureau",
            "Awaiting bureau report",
            "Awaiting officer",
            "Prepared consented demo bureau report",
            prepareReport: true,
            requireReport: false,
            cancellationToken,
            requireConsent: true);

    public Task<DemoActionOutcome> RecordDecisionAsync(
        string id,
        RecordDemoDecisionRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Decision is not ("Approved" or "Rejected"))
        {
            return Task.FromResult(Failure(
                StatusCodes.Status400BadRequest,
                "Choose Approved or Rejected."));
        }

        return TransitionAsync(
            id,
            request.ActorAccountId,
            "Credit Officer",
            "Awaiting officer",
            request.Decision,
            $"Credit Officer recorded a demo {request.Decision.ToLowerInvariant()} decision",
            prepareReport: false,
            requireReport: false,
            cancellationToken);
    }

    public async Task<DemoActionOutcome> UpdateLimitsAsync(
        UpdateDemoWorkflowLimitsRequest request,
        CancellationToken cancellationToken)
    {
        var state = await repository.GetStateAsync(cancellationToken);
        var account = state.Accounts.FirstOrDefault(item => item.Id == request.ActorAccountId);
        if (account?.Role != "Administrator")
        {
            return Failure(StatusCodes.Status403Forbidden, "An administrator demo account is required.");
        }

        if (request.RequiredDocuments.Any(document => !KnownDocuments.Contains(document)))
        {
            return Failure(StatusCodes.Status400BadRequest, "The settings include an unknown document type.");
        }

        await repository.UpdateLimitsAsync(request.ActorAccountId, request, cancellationToken);
        return Success("Demo workflow limits saved to SQL Server.");
    }

    private async Task<DemoActionOutcome> TransitionAsync(
        string id,
        string actorAccountId,
        string requiredRole,
        string expectedStatus,
        string nextStatus,
        string action,
        bool prepareReport,
        bool requireReport,
        CancellationToken cancellationToken,
        bool requireConsent = false)
    {
        var state = await repository.GetStateAsync(cancellationToken);
        var account = state.Accounts.FirstOrDefault(item => item.Id == actorAccountId);
        if (account?.Role != requiredRole)
        {
            return Failure(StatusCodes.Status403Forbidden, $"A {requiredRole} demo account is required.");
        }

        var application = state.Applications.FirstOrDefault(item => item.Id == id);
        if (application is null)
        {
            return Failure(StatusCodes.Status404NotFound, "Application not found.");
        }

        if (application.Status != expectedStatus)
        {
            return Failure(StatusCodes.Status409Conflict, $"Application must be in {expectedStatus} status.");
        }

        if (!HasActorScope(account, application))
        {
            return Failure(StatusCodes.Status403Forbidden, "This application is outside the selected actor's scope.");
        }

        if (requireConsent && !application.ConsentRecorded)
        {
            return Failure(StatusCodes.Status409Conflict, "Recorded customer consent is required for a bureau report.");
        }

        if (requireReport && application.ConsentRecorded && !application.ReportPrepared)
        {
            return Failure(StatusCodes.Status409Conflict, "Request and prepare the consented bureau report before officer review.");
        }

        var issues = GetApplicationIssues(application, state.Applications, state.Limits);
        if (issues.Count > 0)
        {
            return Failure(StatusCodes.Status409Conflict, string.Join(" ", issues));
        }

        if (prepareReport && !application.ConsentRecorded)
        {
            return Failure(StatusCodes.Status409Conflict, "A demo report cannot be prepared without recorded consent.");
        }

        var updated = await repository.TryTransitionApplicationAsync(
            id,
            expectedStatus,
            nextStatus,
            actorAccountId,
            action,
            prepareReport,
            cancellationToken);

        return updated
            ? Success(action)
            : Failure(StatusCodes.Status409Conflict, "Application status changed; reload and try again.");
    }

    private static IReadOnlyList<string> GetApplicationIssues(
        DemoApplicationResponse application,
        IReadOnlyList<DemoApplicationResponse> applications,
        DemoWorkflowLimitsResponse limits)
    {
        var issues = new List<string>();
        if (application.RequestedAmount > limits.MaximumApplicationAmount)
        {
            issues.Add($"Amount exceeds the demo per-application cap of {limits.MaximumApplicationAmount:C0}.");
        }

        var bankExposure = applications
            .Where(item => item.BankId == application.BankId && item.Status != "Rejected")
            .Sum(item => item.RequestedAmount);
        if (bankExposure > limits.BankExposureCap)
        {
            issues.Add($"Bank exposure exceeds the demo cap of {limits.BankExposureCap:C0}.");
        }

        if (limits.RequireConsent && !application.ConsentRecorded)
        {
            issues.Add("Customer consent is required before this workflow can proceed.");
        }

        var missingDocuments = limits.RequiredDocuments
            .Except(application.DocumentsProvided, StringComparer.Ordinal)
            .ToArray();
        if (missingDocuments.Length > 0)
        {
            issues.Add($"Missing required documents: {string.Join(", ", missingDocuments)}.");
        }

        return issues;
    }

    private static bool HasActorScope(DemoAccountResponse account, DemoApplicationResponse application) =>
        account.Role switch
        {
            "Broker" => account.ScopeId == application.BrokerId,
            "Bank" or "Credit Officer" => account.ScopeId == application.BankId,
            "Customer" => account.ScopeId == application.CustomerId,
            "Credit Bureau" => application.ConsentRecorded,
            _ => false,
        };

    private static DemoActionOutcome Success(string message) =>
        new(StatusCodes.Status200OK, new(true, message));

    private static DemoActionOutcome Failure(int statusCode, string message) =>
        new(statusCode, new(false, message));
}
