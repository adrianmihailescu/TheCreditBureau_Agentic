using CreditBureau.Api.Domain;

namespace CreditBureau.Api.Application;

public sealed class CreditApplicationService(ICreditApplicationRepository repository)
    : ICreditApplicationService
{
    public IReadOnlyList<CreditApplication> GetAll() => repository.GetAll();

    public CreditApplication? GetById(string id) => repository.GetById(id);
}
