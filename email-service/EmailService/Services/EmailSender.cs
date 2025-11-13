using MailKit.Net.Smtp;
using MimeKit;

namespace EmailService.Services;

public class EmailSender(IConfiguration cfg)
{
    public async Task SendAsync(string to, string subject, string html, CancellationToken ct)
    {
        var msg = new MimeMessage();
        msg.From.Add(MailboxAddress.Parse(cfg["SMTP_FROM"]));
        msg.To.Add(MailboxAddress.Parse(to));
        msg.Subject = subject;
        msg.Body = new TextPart("html") { Text = html };

        using var client = new SmtpClient();
        await client.ConnectAsync(cfg["SMTP_HOST"], int.Parse(cfg["SMTP_PORT"]), false, ct);
        if (!string.IsNullOrEmpty(cfg["SMTP_USER"]))
            await client.AuthenticateAsync(cfg["SMTP_USER"], cfg["SMTP_PASS"], ct);
        await client.SendAsync(msg, ct);
        await client.DisconnectAsync(true, ct);
    }
}