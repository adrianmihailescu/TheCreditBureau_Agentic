using CreditBureau.Api.Application;
using Microsoft.AspNetCore.Mvc;

namespace CreditBureau.Api.Controllers;

/// <summary>Provides database-backed data for the fictional demo interface.</summary>
[ApiController]
[Route("api/demo")]
public sealed class DemoStateController(IDemoWorkflowService service) : ControllerBase
{
    /// <summary>Returns participants, accounts, applications, limits, and audit events.</summary>
    [HttpGet("state")]
    [ProducesResponseType<DemoStateResponse>(StatusCodes.Status200OK)]
    public Task<DemoStateResponse> GetState(CancellationToken cancellationToken) =>
        service.GetStateAsync(cancellationToken);
}
