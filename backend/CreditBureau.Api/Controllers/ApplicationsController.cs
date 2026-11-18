using CreditBureau.Api.Application;
using CreditBureau.Api.Domain;
using Microsoft.AspNetCore.Mvc;

namespace CreditBureau.Api.Controllers;

[ApiController]
[Route("api/applications")]
public sealed class ApplicationsController(ICreditApplicationService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<CreditApplication>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<CreditApplication>> GetAll() => Ok(service.GetAll());

    [HttpGet("{id}")]
    [ProducesResponseType<CreditApplication>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<CreditApplication> GetById(string id)
    {
        var application = service.GetById(id);
        return application is null ? NotFound() : Ok(application);
    }
}
