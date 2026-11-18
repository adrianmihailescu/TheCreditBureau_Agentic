namespace CreditBureau.Api.Domain;

public sealed record CreditApplication(
    string Id,
    string CustomerName,
    string BankName,
    string BrokerName,
    string Product,
    decimal RequestedAmount,
    string Status,
    DateOnly SubmittedAt,
    bool ConsentRecorded);
