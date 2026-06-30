using MailKit.Net.Smtp;
using MimeKit;

namespace Brinquedoteca.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task EnviarEmail(
            string destino,
            string assunto,
            string mensagem)
        {
            var email = new MimeMessage();

            email.From.Add(
                MailboxAddress.Parse(
                    _configuration["EmailSettings:Email"]!));

            email.To.Add(MailboxAddress.Parse(destino));

            email.Subject = assunto;

            email.Body = new TextPart("plain")
            {
                Text = mensagem
            };

            using var smtp = new SmtpClient();

            await smtp.ConnectAsync(
                _configuration["EmailSettings:Host"]!,
                int.Parse(_configuration["EmailSettings:Port"]!),
                MailKit.Security.SecureSocketOptions.StartTls);

            await smtp.AuthenticateAsync(
                _configuration["EmailSettings:Email"]!,
                _configuration["EmailSettings:Senha"]!);

            await smtp.SendAsync(email);

            await smtp.DisconnectAsync(true);
        }
    }
}