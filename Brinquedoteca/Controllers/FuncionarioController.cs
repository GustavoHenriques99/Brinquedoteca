
using Microsoft.EntityFrameworkCore;
using Brinquedoteca.Data;
using Brinquedoteca.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Brinquedoteca.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FuncionarioController : ControllerBase
    {
        private readonly BrinquedotecaDbContext _context;

        public FuncionarioController(BrinquedotecaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Funcionario>>> Get()
        {
            return await _context.Funcionario.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Funcionario>> Get(int id)
        {
            var funcionario = await _context.Funcionario.FindAsync(id);

            if (funcionario == null)
                return NotFound();

            return funcionario;
        }

        [HttpPost]
        public async Task<ActionResult<Funcionario>> Post(Funcionario funcionario)
        {
            funcionario.DataCadastro = DateTime.SpecifyKind(funcionario.DataCadastro, DateTimeKind.Utc);

            _context.Funcionario.Add(funcionario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = funcionario.Id }, funcionario);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Funcionario funcionario)
        {
            if (id != funcionario.Id)
                return BadRequest();

            _context.Entry(funcionario).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var funcionario = await _context.Funcionario.FindAsync(id);

            if (funcionario == null)
                return NotFound();

            _context.Funcionario.Remove(funcionario);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}