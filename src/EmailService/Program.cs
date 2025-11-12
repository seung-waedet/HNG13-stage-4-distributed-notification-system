using EmailService.Services;
using Microsoft.Extensions.Hosting;
using Serilog;
using StackExchange.Redis;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

Host.CreateDefaultBuilder(args)
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
    .Build()
    .Run();