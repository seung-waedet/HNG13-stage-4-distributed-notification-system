using EmailService.Models;
using EmailService.Utils;
using Newtonsoft.Json;
using Polly;
using System.Text;

namespace EmailService.Services;

public class EmailProcessorBackgroundService(RabbitMqSubscriber mq, StatusStore store, EmailSender sender,
    IHttpClientFactory http, IConfiguration cfg, ILogger<EmailProcessorBackgroundService> log) : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken ct)
    {
        mq.StartConsuming(async (msg, ea) =>
        {
            try
            {
                if (await store.IsProcessedAsync(msg.request_id))
                {
                    mq.Ack(ea.DeliveryTag, false);
                    return;
                }

                var user = await Get<UserDto>($"{cfg["USER_SERVICE_URL"]}/users/{msg.user_id}");
                var template = await Get<TemplateDto>($"{cfg["TEMPLATE_SERVICE_URL"]}/templates/{msg.template_code}");

                if (user == null || template == null || !user.preferences?["email"] == true)
                {
                    await store.MarkProcessedAsync(msg.request_id, "failed");
                    mq.Ack(ea.DeliveryTag, false);
                    return;
                }

                var subject = Render(template.subject, msg.variables);
                var body = Render(template.body, msg.variables);

                await sender.SendAsync(user.email, subject, body, ct);
                await store.MarkProcessedAsync(msg.request_id);
            }
            catch (Exception ex)
            {
                log.LogError(ex, "Failed {RequestId}", msg.request_id);
                var attempt = (msg.metadata?.ContainsKey("attempt") == true) ? (int)msg.metadata["attempt"] + 1 : 1;
                if (attempt > 5)
                {
                    mq.PublishToFailed(ea.Body.ToArray());
                    await store.MarkProcessedAsync(msg.request_id, "failed", attempt, ex.Message);
                }
                else
                {
                    await Task.Delay(2000 * (int)Math.Pow(2, attempt - 1));
                    // Republish with attempt
                    msg.metadata ??= new();
                    msg.metadata["attempt"] = attempt;
                    var json = JsonConvert.SerializeObject(msg, SnakeCaseJsonSettings.Settings);
                    mq.Publish("email", Encoding.UTF8.GetBytes(json));
                }
            }
            mq.Ack(ea.DeliveryTag, false);
        });

        return Task.CompletedTask;
    }

    private string Render(string template, Dictionary<string, string>? vars) =>
        vars?.Aggregate(template, (c, kv) => c.Replace($"{{{{{kv.Key}}}}}", kv.Value)) ?? template;

    private async Task<T?> Get<T>(string url)
    {
        var client = http.CreateClient("internal");
        var res = await Policy
            .Handle<HttpRequestException>()
            .OrResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
            .WaitAndRetryAsync(3, i => TimeSpan.FromSeconds(i))
            .ExecuteAsync(() => client.GetAsync(url));

        if (!res.IsSuccessStatusCode) return default;
        var json = await res.Content.ReadAsStringAsync();
        var root = JsonConvert.DeserializeObject<dynamic>(json);
        if (root?.success != true) return default;
        return JsonConvert.DeserializeObject<T>(JsonConvert.SerializeObject(root.data), SnakeCaseJsonSettings.Settings);
    }
}