namespace EmailService.Models;

public class NotificationMessage
{
    public string request_id { get; set; } = default!;
    public string notification_id { get; set; } = default!;
    public string notification_type { get; set; } = default!;
    // public Guid user_id { get; set; }
    public UserDto user { get; set; }
<<<<<<< HEAD
    public TemplateDto template { get; set; }
    //public string template_code { get; set; } = default!;
=======
    public TemplateDto template { get; set; } = default!;
>>>>>>> 2c8595d5 (feat: Enhance notification system stability and API, response format too, refractored api-gateway, fixed docker-compose to run all services well)
    public Dictionary<string, string>? variables { get; set; }
    public int priority { get; set; } = 1;
    public Dictionary<string, object>? metadata { get; set; }
}

public class UserDto
{
    public Guid user_id { get; set; }
    public string name { get; set; } = default!;
    public string email { get; set; } = default!;
    public Dictionary<string, bool>? preferences { get; set; }
}

public class TemplateDto
{
    public string template_code { get; set; } = default!;
    public string subject { get; set; } = default!;
    public string body { get; set; } = default!;
}