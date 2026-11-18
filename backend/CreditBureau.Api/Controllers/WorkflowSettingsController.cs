using CreditBureau.Api.Application;
using Microsoft.AspNetCore.Mvc;

namespace CreditBureau.Api.Controllers;

/// <summary>Updates persisted demo workflow configuration.</summary>
[ApiController]
[Route("api/workflow/limits")]
public sealed class WorkflowSettingsController(IDemoWorkflowService service) : ControllerBase
{
    /// <summary>Saves workflow steps, caps, and required prerequisites.</summary>
    [HttpPut]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<DemoWorkflowActionResponse>(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(
        UpdateDemoWorkflowLimitsRequest request,
        CancellationToken cancellationToken)
    {
        var outcome = await service.UpdateLimitsAsync(request, cancellationToken);
        return StatusCode(outcome.StatusCode, outcome.Response);
    }
}
