using CreditBureau.Api.Application;
using CreditBureau.Api.Controllers;
using CreditBureau.Api.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<ICreditApplicationRepository, InMemoryCreditApplicationRepository>();
builder.Services.AddScoped<ICreditApplicationService, CreditApplicationService>();

var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "ok", data = "fictional-demo-only" }));
app.MapControllers();

app.Run();
