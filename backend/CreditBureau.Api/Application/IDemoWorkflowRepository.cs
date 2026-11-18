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
        string nextStatus,
        string actorAccountId,
        string action,
        bool prepareReport,
        CancellationToken cancellationToken);

    Task UpdateLimitsAsync(
        string actorAccountId,
        UpdateDemoWorkflowLimitsRequest request,
        CancellationToken cancellationToken);
}
