using EmailService.Services;
using Microsoft.Extensions.Hosting;
using Serilog;
using StackExchange.Redis;
using System.Net;
using System.Text;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

var host = Host.CreateDefaultBuilder(args)
    .UseSerilog()
    .ConfigureServices((hostContext, services) =>
    {
        var cfg = hostContext.Configuration;

        // Redis
        var redis = ConnectionMultiplexer.Connect($"{cfg["REDIS_HOST"]}:6379");
        services.AddSingleton<IConnectionMultiplexer>(redis);
        services.AddSingleton<StatusStore>();

        // Core services
        services.AddSingleton<RabbitMqSubscriber>();
        services.AddSingleton<EmailSender>();
        services.AddHttpClient("internal");

        // Background worker
        services.AddHostedService<EmailProcessorBackgroundService>();
    })
    .Build();

// --- Simple Health Endpoint (No ASP.NET Core Required) ---
_ = Task.Run(async () =>
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
    var listener = new HttpListener();
    listener.Prefixes.Add($"http://+:{port}/health/");
    listener.Start();

    Log.Information($"Health endpoint listening on http://+:{port}/health");

    while (true)
    {
        var context = await listener.GetContextAsync();
        var response = context.Response;
        var buffer = Encoding.UTF8.GetBytes("{\"status\":\"healthy\"}");
        response.ContentType = "application/json";
        response.ContentLength64 = buffer.Length;
        await response.OutputStream.WriteAsync(buffer);
        response.Close();
    }
});

await host.RunAsync();
