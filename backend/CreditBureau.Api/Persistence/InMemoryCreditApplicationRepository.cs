using CreditBureau.Api.Application;
using CreditBureau.Api.Domain;

namespace CreditBureau.Api.Persistence;

public sealed class InMemoryCreditApplicationRepository : ICreditApplicationRepository
{
    private static readonly IReadOnlyList<CreditApplication> Applications =
    [
        new("APP-2026-001", "Jordan Lee", "Northstar Community Bank", "Bridgeway Finance",
            "Personal loan", 12500m, "In review", new(2026, 11, 17), true),
        new("APP-2026-002", "Taylor Morgan", "Harborline Credit Union", "CommonGround Advisors",
            "Auto loan", 28600m, "Documents needed", new(2026, 11, 16), true),
        new("APP-2026-003", "Casey Rivera", "Cedar & Stone Bank", "Bridgeway Finance",
            "Small business loan", 42000m, "Awaiting officer", new(2026, 11, 14), true),
        new("APP-2026-004", "Riley Chen", "Northstar Community Bank", "CommonGround Advisors",
            "Personal loan", 8000m, "Consent required", new(2026, 11, 12), false),
    ];

    public IReadOnlyList<CreditApplication> GetAll() => Applications;

    public CreditApplication? GetById(string id) =>
        Applications.FirstOrDefault(application =>
            string.Equals(application.Id, id, StringComparison.OrdinalIgnoreCase));
}
