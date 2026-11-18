using CreditBureau.Api.Application;
using Microsoft.AspNetCore.Mvc;

namespace CreditBureau.Api.Controllers;

/// <summary>Reads and advances fictional demo credit applications.</summary>
[ApiController]
[Route("api/applications")]
public sealed class ApplicationsController(IDemoWorkflowService service) : ControllerBase
{
    /// <summary>Lists all applications in the configured demo database.</summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<DemoApplicationResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<DemoApplicationResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        var state = await service.GetStateAsync(cancellationToken);
        return Ok(state.Applications);
    }

    /// <summary>Gets one application by its identifier.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType<DemoApplicationResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DemoApplicationResponse>> GetById(
        string id,
        CancellationToken cancellationToken)
    {
        var application = await service.GetApplicationAsync(id, cancellationToken);
        return application is null ? NotFound() : Ok(application);
    }

    /// <summary>Creates and persists a customer application.</summary>
    [HttpPost]
    [ProducesResponseType<DemoApplicationResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<DemoApplicationResponse>> Create(
        CreateDemoApplicationRequest request,
        CancellationToken cancellationToken)
    {
        var outcome = await service.CreateApplicationAsync(request, cancellationToken);
        if (outcome.StatusCode != StatusCodes.Status201Created)
        {
            return StatusCode(outcome.StatusCode, outcome.Response);
        }

        var application = await service.GetApplicationAsync(
            outcome.Response.ApplicationId!,
            cancellationToken);
        return application is null
            ? Problem("The application was saved but could not be reloaded.")
            : CreatedAtAction(nameof(GetById), new { id = application.Id }, application);
    }

    /// <summary>Routes an eligible application from a broker to a bank.</summary>
    [HttpPost("{id}/route-to-bank")]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status409Conflict)]
    public Task<IActionResult> RouteToBank(
        string id,
        DemoActorRequest request,
        CancellationToken cancellationToken) =>
        ExecuteAsync(service.RouteToBankAsync(id, request, cancellationToken));

    /// <summary>Requests a bureau report for a consented bank application.</summary>
    [HttpPost("{id}/request-bureau-report")]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status409Conflict)]
    public Task<IActionResult> RequestBureauReport(
        string id,
        DemoActorRequest request,
        CancellationToken cancellationToken) =>
        ExecuteAsync(service.RequestBureauReportAsync(id, request, cancellationToken));

    /// <summary>Hands a bank application to its credit officer.</summary>
    [HttpPost("{id}/send-to-officer")]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status409Conflict)]
    public Task<IActionResult> SendToOfficer(
        string id,
        DemoActorRequest request,
        CancellationToken cancellationToken) =>
        ExecuteAsync(service.SendToOfficerAsync(id, request, cancellationToken));

    /// <summary>Prepares a fictional bureau report after a consented request.</summary>
    [HttpPost("{id}/prepare-bureau-report")]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status409Conflict)]
    public Task<IActionResult> PrepareBureauReport(
        string id,
        DemoActorRequest request,
        CancellationToken cancellationToken) =>
        ExecuteAsync(service.PrepareBureauReportAsync(id, request, cancellationToken));

    /// <summary>Records the credit officer's manual demo decision.</summary>
    [HttpPost("{id}/decision")]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status409Conflict)]
    public Task<IActionResult> RecordDecision(
        string id,
        RecordDemoDecisionRequest request,
        CancellationToken cancellationToken) =>
        ExecuteAsync(service.RecordDecisionAsync(id, request, cancellationToken));

    private async Task<IActionResult> ExecuteAsync(Task<DemoActionOutcome> operation)
    {
        var outcome = await operation;
        return StatusCode(outcome.StatusCode, outcome.Response);
    }
}
