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

    Task<DemoActionOutcome> RouteToBankAsync(
        string id,
        DemoActorRequest request,
        CancellationToken cancellationToken);

    Task<DemoActionOutcome> RequestBureauReportAsync(
        string id,
        DemoActorRequest request,
        CancellationToken cancellationToken);

    Task<DemoActionOutcome> SendToOfficerAsync(
        string id,
        DemoActorRequest request,
        CancellationToken cancellationToken);

    Task<DemoActionOutcome> PrepareBureauReportAsync(
        string id,
        DemoActorRequest request,
        CancellationToken cancellationToken);

    Task<DemoActionOutcome> RecordDecisionAsync(
        string id,
        RecordDemoDecisionRequest request,
        CancellationToken cancellationToken);

    Task<DemoActionOutcome> UpdateLimitsAsync(
        UpdateDemoWorkflowLimitsRequest request,
        CancellationToken cancellationToken);
}
