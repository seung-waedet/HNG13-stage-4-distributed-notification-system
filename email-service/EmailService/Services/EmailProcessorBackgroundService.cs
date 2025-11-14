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
            log.LogInformation("Starting to process notification {NotificationId} (Request ID: {RequestId})", msg.notification_id, msg.request_id);
            try
            {
                // BUG FIX: Use notification_id for the idempotency check
                if (await store.IsProcessedAsync(msg.notification_id))
                {
                    mq.Ack(ea.DeliveryTag, false);
                    return;
                }

                var user = msg.user;
                var template = msg.template;

                if (user == null || template == null || !user.preferences.GetValueOrDefault("email"))
                {
                    log.LogWarning("Validation failed for notification {NotificationId}. User or template is null, or email preference is disabled.", msg.notification_id);
                    // BUG FIX: Use notification_id to mark as failed
                    await store.MarkProcessedAsync(msg.notification_id, msg.request_id, "failed");
                    mq.Ack(ea.DeliveryTag, false);
                    return;
                }

                log.LogInformation("Rendering template '{TemplateCode}' for user {UserId}", template.template_code, user.user_id);
                var subject = Render(template.subject, msg.variables);
                var body = Render(template.body, msg.variables);

                await sender.SendAsync(user.email, subject, body, ct);
                await store.MarkProcessedAsync(msg.notification_id, msg.request_id);
                log.LogInformation("Successfully processed notification {NotificationId}", msg.notification_id);
            }
            catch (Exception ex)
            {
                log.LogError(ex, "Failed to process notification {NotificationId}", msg.notification_id);
                var attempt = (msg.metadata?.ContainsKey("attempt") == true) ? Convert.ToInt32(msg.metadata["attempt"]) + 1 : 1;
                if (attempt > 5)
                {
                    log.LogCritical("Attempt {Attempt} failed for notification {NotificationId}. Moving to failed queue.", attempt, msg.notification_id);
                    mq.PublishToFailed(ea.Body.ToArray());
                    await store.MarkProcessedAsync(msg.notification_id, msg.request_id, "failed", attempt, ex.Message);
                }
                else
                {
                    var delay = 2000 * (int)Math.Pow(2, attempt - 1);
                    log.LogWarning("Attempt {Attempt} for notification {NotificationId} failed. Retrying in {Delay}ms", attempt, msg.notification_id, delay);
                    await Task.Delay(delay);
                    
                    msg.metadata ??= new();
                    msg.metadata["attempt"] = attempt;
                    var json = JsonConvert.SerializeObject(msg, SnakeCaseJsonSettings.Settings);
                    mq.Publish("email", Encoding.UTF8.GetBytes(json));
                }
            }
            finally
            {
                mq.Ack(ea.DeliveryTag, false);
            }
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
            .WaitAndRetryAsync(3, i => TimeSpan.FromSeconds(i), (outcome, timespan, retryAttempt, context) =>
            {
                log.LogWarning("Request to {Url} failed. Delaying {Timespan}. Making attempt {RetryAttempt}", url, timespan, retryAttempt);
            })
            .ExecuteAsync(() => client.GetAsync(url));

        if (!res.IsSuccessStatusCode)
        {
            log.LogError("Request to {Url} failed after retries with status {StatusCode}", url, res.StatusCode);
            return default;
        }
        
        var json = await res.Content.ReadAsStringAsync();
        var root = JsonConvert.DeserializeObject<dynamic>(json);
        if (root?.success != true)
        {
            log.LogWarning("Request to {Url} was successful, but response indicates failure.", url);
            return default;
        }
        return JsonConvert.DeserializeObject<T>(JsonConvert.SerializeObject(root.data), SnakeCaseJsonSettings.Settings);
    }
}