using Brinquedoteca.Data;
using Brinquedoteca.Models;
using Microsoft.EntityFrameworkCore;

public class RAService
{
    private readonly BrinquedotecaDbContext _context;

    public RAService(BrinquedotecaDbContext context)
    {
        _context = context;
    }

    public async Task<string> GerarRAAsync(DateTime dataCadastro)
    {
        var ano = dataCadastro.Year.ToString().Substring(2);
        var semestre = dataCadastro.Month <= 6 ? "1" : "2";
        var sufixo = $"{ano}-{semestre}";

        // Filtra apenas alunos com RA não-nulo antes de fazer o EndsWith
        var ultimoRA = await _context.Aluno
            .Where(a => a.RA != null && a.RA.EndsWith(sufixo))
            .OrderByDescending(a => a.RA)
            .Select(a => a.RA)
            .FirstOrDefaultAsync();

        int proximoNumero = 1;

        if (ultimoRA != null)
        {
            var numeroAtual = int.Parse(ultimoRA.Substring(0, 4));
            proximoNumero = numeroAtual + 1;
        }

        return $"{proximoNumero:D4}/{sufixo}";
    }
}
