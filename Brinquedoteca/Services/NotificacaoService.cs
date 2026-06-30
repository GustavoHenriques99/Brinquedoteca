using Microsoft.EntityFrameworkCore;
using Brinquedoteca.Data;

namespace Brinquedoteca.Services
{
    public class NotificacaoService
    {
        private readonly BrinquedotecaDbContext _context;
        private readonly EmailService _emailService;

        public NotificacaoService(
            BrinquedotecaDbContext context,
            EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }


        // AVISO 2 DIAS ANTES
        public async Task VerificarDevolucaoProxima()
        {
            var dataAviso = DateTime.UtcNow.AddDays(2).Date;

            var emprestimos = await _context.Emprestimo
                .Include(e => e.Aluno)
                .Include(e => e.Estoque)
                .ThenInclude(e => e.Item!)
                .Where(e =>
                    e.Finalizado == false &&
                    e.DataPrevistaDevolucao.Date == dataAviso)
                .ToListAsync();

            foreach (var emprestimo in emprestimos)
            {
                if (emprestimo.Aluno == null ||
                    emprestimo.Estoque == null ||
                    emprestimo.Estoque.Item == null)
                {
                    continue;
                }

                //Mensagem correta para aviso (não é atraso, é lembrete)
                await _emailService.EnviarEmail(
                    emprestimo.Aluno.Email,
                    "Lembrete de devolução",
                    $"Olá {emprestimo.Aluno.Nome}, " +
                    $"o item {emprestimo.Estoque.Item.Descricao} " +
                    $"deve ser devolvido em 2 dia(s).");
            }
        }


        // ATRASADOS
        public async Task VerificarAtrasados()
        {
            var hoje = DateTime.UtcNow.Date;

            var atrasados = await _context.Emprestimo
                .Include(e => e.Aluno)
                .Include(e => e.Estoque)
                .ThenInclude(e => e.Item)
                .Where(e =>
                    e.Finalizado == false &&
                    e.DataPrevistaDevolucao < hoje)
                .ToListAsync();

            foreach (var emprestimo in atrasados)
            {
                if (emprestimo.Aluno == null ||     // null check explícito
                    emprestimo.Estoque == null ||   //    em vez de ! operator
                    emprestimo.Estoque.Item == null)
                {
                    continue;
                }

                var diasAtraso = (hoje - emprestimo.DataPrevistaDevolucao.Date).Days;

                await _emailService.EnviarEmail(
                    emprestimo.Aluno.Email,
                    "Empréstimo em atraso",
                    $"Olá {emprestimo.Aluno.Nome}, " +
                    $"o item {emprestimo.Estoque.Item.Descricao} " +
                    $"está atrasado há {diasAtraso} dia(s).");
            }
        }
    }
}