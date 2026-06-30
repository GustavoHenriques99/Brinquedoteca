using Brinquedoteca.Data;
using Brinquedoteca.DTO;
using Brinquedoteca.Models;
using Brinquedoteca.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Brinquedoteca.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmprestimoController : ControllerBase
    {
        private readonly BrinquedotecaDbContext _context;
        private readonly EmprestimoService _emprestimoService;

        public EmprestimoController(BrinquedotecaDbContext context, EmprestimoService emprestimoService)
        {
            _context = context;
            _emprestimoService = emprestimoService;
        }

        // GET — inclui Item dentro de Estoque para mostrar nome do brinquedo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Emprestimo>>> Get()
        {
            return await _context.Emprestimo
                .Include(e => e.Funcionario)
                .Include(e => e.Aluno)
                .Include(e => e.Estoque)
                    .ThenInclude(est => est!.Item)   // ✅ FIX #3 — item do estoque
                .ToListAsync();
        }

        // GET ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Emprestimo>> Get(int id)
        {
            var emprestimo = await _context.Emprestimo
                .Include(e => e.Funcionario)
                .Include(e => e.Aluno)
                .Include(e => e.Estoque)
                    .ThenInclude(est => est!.Item)   // ✅ FIX #3
                .FirstOrDefaultAsync(e => e.Id == id);

            if (emprestimo == null)
                return NotFound();

            return emprestimo;
        }

        // POST — realizar empréstimo
        [HttpPost]
        public async Task<IActionResult> Post(EmprestimoDTO dto)
        {
            var resultado = await _emprestimoService.RealizarEmprestimo(dto);

            if (resultado == "Empréstimo realizado com sucesso.")
                return Ok(new { mensagem = resultado });

            return BadRequest(new { mensagem = resultado });
        }

        // ✅ FIX #4 — endpoint dedicado de devolução (evita PUT com objeto circular)
        [HttpPatch("{id}/devolver")]
        public async Task<IActionResult> Devolver(int id)
        {
            var resultado = await _emprestimoService.DevolverItem(id);

            if (resultado == "Item devolvido com sucesso.")
                return Ok(new { mensagem = resultado });

            return BadRequest(new { mensagem = resultado });
        }

        // PUT — atualização genérica (apenas campos primitivos, sem navegações)
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] EmprestimoDTO dto)
        {
            var emprestimo = await _context.Emprestimo.FindAsync(id);
            if (emprestimo == null) return NotFound();

            emprestimo.DataPrevistaDevolucao = DateTime.SpecifyKind(dto.DataPrevistaDevolucao, DateTimeKind.Utc);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var emprestimo = await _context.Emprestimo.FindAsync(id);

            if (emprestimo == null)
                return NotFound();

            _context.Emprestimo.Remove(emprestimo);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}