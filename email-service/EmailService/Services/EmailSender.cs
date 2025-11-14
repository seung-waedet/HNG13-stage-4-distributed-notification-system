using MailKit.Net.Smtp;
using MimeKit;

namespace EmailService.Services;

public class EmailSender(IConfiguration cfg, ILogger<EmailSender> log)
{
    public async Task SendAsync(string to, string subject, string html, CancellationToken ct)
    {
        var msg = new MimeMessage();
        msg.From.Add(MailboxAddress.Parse(cfg["SMTP_FROM"]));
        msg.To.Add(MailboxAddress.Parse(to));
        msg.Subject = subject;
        msg.Body = new TextPart("html") { Text = html };

        using var client = new SmtpClient();
        var host = cfg["SMTP_HOST"];
        var port = int.Parse(cfg["SMTP_PORT"]);

        log.LogInformation("Connecting to SMTP server {Host}:{Port}", host, port);
        await client.ConnectAsync(host, port, false, ct);
        log.LogInformation("Connection established");

        if (!string.IsNullOrEmpty(cfg["SMTP_USER"]))
        {
            log.LogInformation("Attempting to authenticate as {User}", cfg["SMTP_USER"]);
            await client.AuthenticateAsync(cfg["SMTP_USER"], cfg["SMTP_PASS"], ct);
            log.LogInformation("Authentication successful");
        }

        log.LogInformation("Sending email with subject '{Subject}' to {To}", subject, to);
        await client.SendAsync(msg, ct);
        log.LogInformation("Email sent successfully");

        await client.DisconnectAsync(true, ct);
        log.LogInformation("Disconnected from SMTP server");
    }
}