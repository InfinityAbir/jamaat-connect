using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace JamaatConnect.Infrastructure.Services
{
    public class SmtpSettings
    {
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; } = 587;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string SenderEmail { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public bool EnableSsl { get; set; } = true;
    }

    public class SmtpEmailService : JamaatConnect.Application.Interfaces.ISmtpEmailService
    {
        private readonly SmtpSettings _settings;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(IOptions<SmtpSettings> settings, ILogger<SmtpEmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody, string? textBody = null)
        {
            // If no SMTP host is configured, log the email content instead of failing
            if (string.IsNullOrEmpty(_settings.Host))
            {
                _logger.LogInformation(
                    "SMTP not configured. Email would be sent to: {ToEmail}, Subject: {Subject}, Body: {HtmlBody}",
                    toEmail, subject, htmlBody);
                return;
            }

            try
            {
                using var client = new SmtpClient(_settings.Host, _settings.Port)
                {
                    EnableSsl = _settings.EnableSsl,
                    Credentials = new NetworkCredential(_settings.Username, _settings.Password)
                };

                var senderName = string.IsNullOrWhiteSpace(_settings.SenderName) ? "Jamaat Connect" : _settings.SenderName;
                using var message = new MailMessage
                {
                    From = new MailAddress(_settings.SenderEmail, senderName),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };
                message.To.Add(toEmail);

                if (!string.IsNullOrEmpty(textBody))
                {
                    message.AlternateViews.Add(
                        AlternateView.CreateAlternateViewFromString(textBody, null, "text/plain")
                    );
                }

                await client.SendMailAsync(message);
                _logger.LogInformation("Email sent successfully to {ToEmail} with subject: {Subject}", toEmail, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail);
                throw;
            }
        }

        public async Task SendListingStatusUpdateAsync(string toEmail, string displayName, string listingTitle, string status, string? reason = null)
        {
            var subject = $"Jamaat Connect: Listing Update - {listingTitle}";
            var htmlBody = $@"
<html>
<body style='font-family: Arial, sans-serif; color: #333;'>
  <div style='padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>
    <h2 style='color: #065F46;'>Hello {displayName},</h2>
    <p>Your listing <strong>{listingTitle}</strong> has been updated.</p>
    <p><strong>Status:</strong> {status}</p>
    {(string.IsNullOrEmpty(reason) ? "" : $"<p><strong>Reason:</strong> {reason}</p>")}
    <p style='color: #666; font-size: 12px;'>Please log in to your Jamaat Connect account for more details.</p>
  </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, htmlBody);
        }
    }
}
