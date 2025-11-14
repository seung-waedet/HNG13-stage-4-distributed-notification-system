using EmailService.Utils;
using StackExchange.Redis;

namespace EmailService.Services;

public class StatusStore(IConnectionMultiplexer redis, ILogger<StatusStore> log)
{
    private readonly IDatabase _db = redis.GetDatabase();
    private readonly TimeSpan _ttl = TimeSpan.FromDays(7);

    private string Key(string id) => $"notification:{id}";

    public async Task<bool> IsProcessedAsync(string notificationId)
    {
        var key = Key(notificationId);
        log.LogInformation("Checking for processed notification with key {Key}", key);
        var exists = await _db.KeyExistsAsync(key);
        if (exists)
        {
            log.LogWarning("Notification {NotificationId} has already been processed", notificationId);
        }
        return exists;
    }


    public async Task MarkProcessedAsync(string notificationId, string requestId, string status = "sent", int attempts = 0, string? error = null)
    {
        var key = Key(notificationId);
        log.LogInformation("Marking notification {NotificationId} as {Status} with key {Key}", notificationId, status, key);
        var payload = new { notification_id = notificationId, request_id = requestId, status, attempts, error, updated_at = DateTime.UtcNow };
        var json = Newtonsoft.Json.JsonConvert.SerializeObject(payload, SnakeCaseJsonSettings.Settings);
        await _db.StringSetAsync(key, json, _ttl);
    }
}
