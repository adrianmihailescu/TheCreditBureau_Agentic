namespace CreditBureau.Api.Application;

public interface IDemoWorkflowRepository
{
    Task<DemoStateResponse> GetStateAsync(CancellationToken cancellationToken);

    Task CreateApplicationAsync(
        string applicationId,
        string customerId,
        CreateDemoApplicationRequest request,
        CancellationToken cancellationToken);

    Task<bool> TryTransitionApplicationAsync(
        string applicationId,
        string expectedStatus,
        int expectedStepIndex,
        string expectedActorRole,
        string nextStatus,
        int nextStepIndex,
        string actorAccountId,
        string action,
        bool prepareReport,
        CancellationToken cancellationToken);

    Task UpdateLimitsAsync(
        string actorAccountId,
        UpdateDemoWorkflowLimitsRequest request,
        CancellationToken cancellationToken);
}
