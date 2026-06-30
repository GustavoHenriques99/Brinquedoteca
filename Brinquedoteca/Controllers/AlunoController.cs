using System.Threading.Tasks;
using Brinquedoteca.Data;
using Brinquedoteca.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

//controller de gerenciamento dos alunos, com as operações de CRUD incluida  e criação automatica do RA

namespace Brinquedoteca.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlunoController : Controller
    {
        private readonly BrinquedotecaDbContext _context;
        private readonly RAService _raService;

        public AlunoController(BrinquedotecaDbContext context, RAService raService)
        {
            _context = context;
            _raService = raService;
        }

        //public static List<Aluno> listaAluno = new List<Aluno>();

        [HttpPost]
        public async Task<IActionResult> PostAluno([FromBody] Aluno aluno)
        {
            try
            {
                // Corrige DateTime
                aluno.DataNascimento = DateTime.SpecifyKind(aluno.DataNascimento, DateTimeKind.Utc);


                var ra = await _raService.GerarRAAsync(DateTime.UtcNow);
                aluno.DefinirRA(ra);

                _context.Aluno.Add(aluno);
                await _context.SaveChangesAsync();

                return Ok(aluno);
            }
            catch (Exception ex)
            {
                var erro = ex.InnerException?.InnerException?.Message
                           ?? ex.InnerException?.Message
                           ?? ex.Message;

                return BadRequest($"ERRO REAL: {erro}");
            }
        }


        [HttpGet]
        public IActionResult GetAluno()
        {
            var result = _context.Aluno
                .Include(a => a.Turma)
                .ToList();
            return Ok(result);

        }


        [HttpGet("{id}")]
        public IActionResult GetAlunoById(int id)
        {
            var aluno = _context.Aluno
                .Include(a => a.Turma)
                .FirstOrDefault(a => a.Id == id);
            if (aluno == null)
            {
                return NotFound("Aluno não encontrado.");
            }
            return Ok(aluno);
        }


        [HttpGet("ra/{ra}")]//Pesuusar por RA
        public IActionResult GetAlunoByRA(string ra)
        {
            var aluno = _context.Aluno.FirstOrDefault(a => a.RA == ra);

            if (aluno == null)
                return NotFound("Aluno não encontrado.");

            return Ok(aluno);
        }


        [HttpPut("{id}")]
        public IActionResult PutAluno(int id, [FromBody] Aluno aluno)
        {
            var alunoExistente = _context.Aluno.Find(id);

            if (alunoExistente == null)
                return NotFound("Aluno não encontrado.");

            alunoExistente.Nome = aluno.Nome;
            alunoExistente.Sobrenome = aluno.Sobrenome;
            alunoExistente.DataNascimento = aluno.DataNascimento;
            alunoExistente.Telefone = aluno.Telefone;
            alunoExistente.Email = aluno.Email;
            alunoExistente.Turma = aluno.Turma;

            _context.SaveChanges();

            return Ok(alunoExistente);
        }


        [HttpDelete("{id}")]
        public IActionResult DeleteAluno(int id)
        {
            var alunoExistente = _context.Aluno.Find(id);
            if (alunoExistente == null)
            {
                return NotFound("Aluno não encontrado.");
            }
            _context.Aluno.Remove(alunoExistente);
            _context.SaveChanges();
            return Ok($"Aluno com ID {id} deletado com sucesso.");
        }
    }
}

/*
Esse controller:

Cria aluno com RA automático
Lista alunos
Busca por ID e RA
Atualiza dados
Deleta aluno

*/