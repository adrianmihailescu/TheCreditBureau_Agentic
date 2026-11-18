using CreditBureau.Api.Domain;

namespace CreditBureau.Api.Application;

public interface ICreditApplicationService
{
    IReadOnlyList<CreditApplication> GetAll();

    CreditApplication? GetById(string id);
}
