using Microsoft.EntityFrameworkCore;
using Brinquedoteca.Data;
using Brinquedoteca.DTO;
using Brinquedoteca.Models;
using Brinquedoteca.Utils;

namespace Brinquedoteca.Services
{
    public class EmprestimoService
    {
        private readonly BrinquedotecaDbContext _context;
        private readonly EmailService _emailService;

        public EmprestimoService(BrinquedotecaDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // REALIZAR EMPRÉSTIMO
        public async Task<string> RealizarEmprestimo(EmprestimoDTO dto)
        {

            // ESTOQUE
            var estoque = await _context.Estoque
                .Include(e => e.Item)
                .FirstOrDefaultAsync(e => e.Id == dto.EstoqueId);

            if (estoque == null)
                return "Item não encontrado.";


            // STATUS DISPONÍVEL
            if (estoque.StatusId != StatusEstoque.DISPONIVEL)
                return "Item indisponível.";


            // ALUNO EXISTE
            var aluno = await _context.Aluno
                .FirstOrDefaultAsync(a => a.Id == dto.AlunoId);

            if (aluno == null)
                return "Aluno não encontrado.";


            // FUNCIONÁRIO EXISTE
            var funcionario = await _context.Funcionario
                .FirstOrDefaultAsync(f => f.Id == dto.FuncionarioId);

            if (funcionario == null)
                return "Funcionário não encontrado.";


            // ITEM JÁ EMPRESTADO
            var emprestimoAtivo = await _context.Emprestimo
                .AnyAsync(e =>
                    e.EstoqueId == dto.EstoqueId &&
                    e.Finalizado == false);

            if (emprestimoAtivo)
                return "Item já emprestado.";

            // LIMITE DE EMPRÉSTIMOS
            var quantidadeEmprestimos = await _context.Emprestimo
                .CountAsync(e =>
                    e.AlunoId == dto.AlunoId &&
                    e.Finalizado == false);

            if (quantidadeEmprestimos >= 2)
                return "Aluno atingiu limite de empréstimos.";


            // ATRASOS
            var atraso = await _context.Emprestimo
                .AnyAsync(e =>
                    e.AlunoId == dto.AlunoId &&
                    e.Finalizado == false &&
                    e.DataPrevistaDevolucao < DateTime.UtcNow);

            if (atraso)
                return "Aluno possui devoluções em atraso.";


            // ALTERA STATUS
            estoque.StatusId = StatusEstoque.EMPRESTADO;


            // CRIA EMPRÉSTIMO
            var emprestimo = new Emprestimo
            {
                FuncionarioId = dto.FuncionarioId,
                AlunoId = dto.AlunoId,
                EstoqueId = dto.EstoqueId,
                DataPrevistaDevolucao = dto.DataPrevistaDevolucao.ToUniversalTime()
            };
            _context.Emprestimo.Add(emprestimo);


            // SALVA
            await _context.SaveChangesAsync();

            // ADICIONA após o SaveChangesAsync
            await _emailService.EnviarEmail(
                aluno.Email,
                "Confirmação de empréstimo",
                $"Olá {aluno.Nome}, o item {estoque.Item!.Descricao} " +
                $"foi emprestado com sucesso. " +
                $"Devolução prevista: {dto.DataPrevistaDevolucao:dd/MM/yyyy}.");

            return "Empréstimo realizado com sucesso.";
        }


        // DEVOLVER ITEM
        public async Task<string> DevolverItem(int emprestimoId)
        {
            var emprestimo = await _context.Emprestimo
                .Include(e => e.Aluno)//vartiavel para confitmação da devolução por nome
                .Include(e => e.Estoque)
                    .ThenInclude(est => est!.Item) 
                .FirstOrDefaultAsync(e => e.Id == emprestimoId);

            if (emprestimo == null)
                return "Empréstimo não encontrado.";


            // JÁ DEVOLVIDO
            if (emprestimo.Finalizado)
                return "Item já devolvido.";

            // DEVOLVE
            emprestimo.DataDevolucao = DateTime.UtcNow;
            emprestimo.Finalizado = true;
            emprestimo.Estoque!.StatusId = StatusEstoque.DISPONIVEL;
            await _context.SaveChangesAsync();

            //ADICIONA após o SaveChangesAsync
            await _emailService.EnviarEmail(
                emprestimo.Aluno!.Email,
                "Confirmação de devolução",
                $"Olá {emprestimo.Aluno.Nome}, o item " +
                $"{emprestimo.Estoque.Item!.Descricao} " +  // ← inclui Item no Include acima tbm
                $"foi devolvido com sucesso. Obrigado!");

            return "Item devolvido com sucesso.";
        }
    }
}