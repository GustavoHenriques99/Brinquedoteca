using Microsoft.EntityFrameworkCore;
using Brinquedoteca.Data;
using Brinquedoteca.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Brinquedoteca.Controllers
{    [Route("api/[controller]")]
    [ApiController]
    public class EstoqueController : ControllerBase
    {
        private readonly BrinquedotecaDbContext _context;

        public EstoqueController(BrinquedotecaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Estoque>>> Get()
        {
            return await _context.Estoque
                .Include(e => e.Item)
                .Include(e => e.Status)
                .Include(e => e.TipoEntrada)
                .Include(e => e.Funcionario)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Estoque>> Get(int id)
        {
            var estoque = await _context.Estoque
                .Include(e => e.Item)
                .Include(e => e.Status)
                .Include(e => e.TipoEntrada)
                .Include(e => e.Funcionario)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (estoque == null)
                return NotFound();

            return estoque;
        }

        [HttpPost]
        public async Task<ActionResult<Estoque>> Post(Estoque estoque)
        {
            _context.Estoque.Add(estoque);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = estoque.Id }, estoque);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Estoque estoque)
        {
            if (id != estoque.Id)
                return BadRequest();

            _context.Entry(estoque).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var estoque = await _context.Estoque.FindAsync(id);

            if (estoque == null)
                return NotFound();

            _context.Estoque.Remove(estoque);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}