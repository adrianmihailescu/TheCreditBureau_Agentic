using CreditBureau.Api.Domain;

namespace CreditBureau.Api.Application;

public interface ICreditApplicationRepository
{
    IReadOnlyList<CreditApplication> GetAll();

    CreditApplication? GetById(string id);
}
