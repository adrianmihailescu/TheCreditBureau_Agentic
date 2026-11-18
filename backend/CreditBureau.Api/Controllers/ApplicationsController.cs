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

    /// <summary>Approves or rejects the application at its current configured workflow step.</summary>
    [HttpPost("{id}/workflow-decision")]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status409Conflict)]
    public Task<IActionResult> RecordWorkflowDecision(
        string id,
        RecordDemoWorkflowDecisionRequest request,
        CancellationToken cancellationToken) =>
        ExecuteAsync(service.RecordWorkflowDecisionAsync(id, request, cancellationToken));

    private async Task<IActionResult> ExecuteAsync(Task<DemoActionOutcome> operation)
    {
        var outcome = await operation;
        return StatusCode(outcome.StatusCode, outcome.Response);
    }
}
