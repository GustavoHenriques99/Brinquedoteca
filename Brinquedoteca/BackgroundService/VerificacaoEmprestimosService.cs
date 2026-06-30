using Brinquedoteca.Services;

//Criando a notificação as Notificações de Emprestimo
namespace Brinquedoteca.BackgroundServices
{
    //instanciando o serviço de notificação para verificar os empréstimos
    public class VerificacaoEmprestimosService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public VerificacaoEmprestimosService(
            IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        //executAsync executando o serviço de forma assíncrona para verificar os empréstimos próximos e atrasados
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try  // ← adiciona
                {
                    using var scope = _serviceProvider.CreateScope();
                    var notificacaoService = scope.ServiceProvider
                        .GetRequiredService<NotificacaoService>();

                    await notificacaoService.VerificarDevolucaoProxima();
                    await notificacaoService.VerificarAtrasados();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Notificacao] Erro: {ex.Message}");
                    //Faz a o sistema  continua rodando mesmo se o e-mail falhar
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}