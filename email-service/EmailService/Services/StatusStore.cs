using EmailService.Utils;
using StackExchange.Redis;

namespace EmailService.Services;

public class StatusStore(IConnectionMultiplexer redis)
{
    private readonly IDatabase _db = redis.GetDatabase();
    private readonly TimeSpan _ttl = TimeSpan.FromDays(7);

    private string Key(string id) => $"notification:request:{id}";

    public async Task<bool> IsProcessedAsync(string requestId) =>
        await _db.KeyExistsAsync(Key(requestId));

    public async Task MarkProcessedAsync(string notificationId, string requestId, string status = "sent", int attempts = 0, string? error = null)
    {
        var payload = new { notification_id = notificationId, request_id = requestId, status, attempts, error, updated_at = DateTime.UtcNow };
        var json = Newtonsoft.Json.JsonConvert.SerializeObject(payload, SnakeCaseJsonSettings.Settings);
        await _db.StringSetAsync(Key(requestId), json, _ttl);
    }
}

// {
//   "request_id": "abc123",
//   "user": {
//     "id": 45,
//     "email": "fabian@example.com",
//     "name": "Fabian Muoghalu",
//     "preferences": {
//       "email": true
//     }
//   },
//   "template": {
//     "code": "welcome_email",
//     "subject": "Welcome, {{first_name}}!",
//     "body": "Hello {{first_name}}, thank you for joining {{app_name}}."
//   },
//   "variables": {
//     "first_name": "Fabian",
//     "app_name": "Travl"
//   },
//   "metadata": {
//     "source": "api-gateway"
//   }
// }
