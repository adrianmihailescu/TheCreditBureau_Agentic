namespace CreditBureau.Api.Application;

public sealed class DemoWorkflowService(IDemoWorkflowRepository repository) : IDemoWorkflowService
{
    private const int MaximumWorkflowSteps = 8;

    private static readonly string[] SupportedWorkflowRoles =
        ["Broker", "Bank", "Credit Bureau", "Credit Officer"];

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
            new(true, $"Application {id} submitted to the {state.Limits.WorkflowSteps[0]} queue.", id));
    }

    public async Task<DemoActionOutcome> RecordWorkflowDecisionAsync(
        string id,
        RecordDemoWorkflowDecisionRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Decision is not ("Approved" or "Rejected"))
        {
            return Failure(
                StatusCodes.Status400BadRequest,
                "Choose Approved or Rejected.");
        }

        var state = await repository.GetStateAsync(cancellationToken);
        var account = state.Accounts.FirstOrDefault(item => item.Id == request.ActorAccountId);
        var application = state.Applications.FirstOrDefault(item => item.Id == id);
        if (application is null)
        {
            return Failure(StatusCodes.Status404NotFound, "Application not found.");
        }

        if (application.Status is "Approved" or "Rejected")
        {
            return Failure(StatusCodes.Status409Conflict, "A completed application cannot continue.");
        }

        if (application.CurrentWorkflowStepIndex < 0 ||
            application.CurrentWorkflowStepIndex >= application.WorkflowSteps.Count)
        {
            return Failure(StatusCodes.Status409Conflict, "The application has no active workflow step.");
        }

        var actorRole = application.WorkflowSteps[application.CurrentWorkflowStepIndex];
        if (account?.Role != actorRole)
        {
            return Failure(StatusCodes.Status403Forbidden, $"A {actorRole} demo account is required.");
        }

        if (!HasActorScope(account, application, request.Decision == "Rejected"))
        {
            return Failure(StatusCodes.Status403Forbidden, "This application is outside the selected actor's scope.");
        }

        var approving = request.Decision == "Approved";
        if (approving)
        {
            var issues = GetApplicationIssues(application, state.Applications, state.Limits);
            if (issues.Count > 0)
            {
                return Failure(StatusCodes.Status409Conflict, string.Join(" ", issues));
            }

            if (actorRole == "Credit Bureau" && !application.ConsentRecorded)
            {
                return Failure(
                    StatusCodes.Status409Conflict,
                    "Recorded customer consent is required before preparing a bureau report.");
            }

            if (actorRole == "Credit Officer" &&
                application.WorkflowSteps.Contains("Credit Bureau", StringComparer.Ordinal) &&
                !application.ReportPrepared)
            {
                return Failure(
                    StatusCodes.Status409Conflict,
                    "The configured bureau step must prepare its consented report before officer review.");
            }
        }

        var isFinalStep = application.CurrentWorkflowStepIndex == application.WorkflowSteps.Count - 1;
        var nextStepIndex = approving && !isFinalStep
            ? application.CurrentWorkflowStepIndex + 1
            : application.WorkflowSteps.Count;
        var nextStatus = request.Decision == "Rejected"
            ? "Rejected"
            : isFinalStep
                ? "Approved"
                : GetStatusForRole(application.WorkflowSteps[nextStepIndex]);
        var prepareReport = approving && actorRole == "Credit Bureau" && !application.ReportPrepared;
        var action = prepareReport
            ? "Credit Bureau prepared a consented demo report and approved the workflow step"
            : $"{actorRole} recorded a demo {request.Decision.ToLowerInvariant()} decision";

        var updated = await repository.TryTransitionApplicationAsync(
            id,
            application.Status,
            application.CurrentWorkflowStepIndex,
            actorRole,
            nextStatus,
            nextStepIndex,
            request.ActorAccountId,
            action,
            prepareReport,
            cancellationToken);

        return updated
            ? Success(request.Decision == "Rejected"
                ? $"{actorRole} rejected the application; the workflow has stopped."
                : isFinalStep
                    ? "Credit Officer approved the application."
                    : $"{actorRole} approved the step; the application moved to {application.WorkflowSteps[nextStepIndex]}.")
            : Failure(StatusCodes.Status409Conflict, "Application status changed; reload and try again.");
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

        if (request.WorkflowSteps.Count is 0 or > MaximumWorkflowSteps ||
            request.WorkflowSteps.Any(role => !SupportedWorkflowRoles.Contains(role, StringComparer.Ordinal)) ||
            request.WorkflowSteps.Count(role => role == "Credit Officer") != 1)
        {
            return Failure(
                StatusCodes.Status400BadRequest,
                "Choose up to eight workflow steps from Broker, Bank, and Credit Bureau, with one final Credit Officer step.");
        }

        if (request.WorkflowSteps[^1] != "Credit Officer")
        {
            return Failure(
                StatusCodes.Status400BadRequest,
                "The final workflow step must be a human Credit Officer approval.");
        }

        await repository.UpdateLimitsAsync(request.ActorAccountId, request, cancellationToken);
        return Success("Demo workflow settings saved to SQL Server.");
    }

    private static string GetStatusForRole(string role) =>
        role switch
        {
            "Broker" => "Submitted",
            "Bank" => "Bank review",
            "Credit Bureau" => "Awaiting bureau report",
            "Credit Officer" => "Awaiting officer",
            _ => throw new InvalidOperationException($"Unsupported workflow actor role: {role}.")
        };

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

    private static bool HasActorScope(
        DemoAccountResponse account,
        DemoApplicationResponse application,
        bool isRejection) =>
        account.Role switch
        {
            "Broker" => account.ScopeId == application.BrokerId,
            "Bank" or "Credit Officer" => account.ScopeId == application.BankId,
            "Customer" => account.ScopeId == application.CustomerId,
            "Credit Bureau" => application.ConsentRecorded || isRejection,
            _ => false,
        };

    private static DemoActionOutcome Success(string message) =>
        new(StatusCodes.Status200OK, new(true, message));

    private static DemoActionOutcome Failure(int statusCode, string message) =>
        new(statusCode, new(false, message));
}
