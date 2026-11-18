using CreditBureau.Api.Application;
using CreditBureau.Api.Controllers;
using CreditBureau.Api.Persistence;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("CreditBureau")
    ?? throw new InvalidOperationException("ConnectionStrings:CreditBureau must be configured.");

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});
builder.Services.AddSingleton<IDemoWorkflowRepository>(
    new SqlDemoWorkflowRepository(connectionString));
builder.Services.AddScoped<IDemoWorkflowService, DemoWorkflowService>();

var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "ok", data = "fictional-demo-only" }));
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseCors("Frontend");
app.MapControllers();

app.Run();
