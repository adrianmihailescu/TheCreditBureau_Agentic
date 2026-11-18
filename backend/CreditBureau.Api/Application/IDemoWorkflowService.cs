namespace CreditBureau.Api.Application;

public sealed record DemoActionOutcome(int StatusCode, DemoWorkflowActionResponse Response);

public interface IDemoWorkflowService
{
    Task<DemoStateResponse> GetStateAsync(CancellationToken cancellationToken);

    Task<DemoApplicationResponse?> GetApplicationAsync(
        string id,
        CancellationToken cancellationToken);

    Task<DemoActionOutcome> CreateApplicationAsync(
        CreateDemoApplicationRequest request,
        CancellationToken cancellationToken);

    Task<DemoActionOutcome> RecordWorkflowDecisionAsync(
        string id,
        RecordDemoWorkflowDecisionRequest request,
        CancellationToken cancellationToken);

    Task<DemoActionOutcome> UpdateLimitsAsync(
        UpdateDemoWorkflowLimitsRequest request,
        CancellationToken cancellationToken);
}
