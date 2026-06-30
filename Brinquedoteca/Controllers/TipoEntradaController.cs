using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Brinquedoteca.Data;
using Brinquedoteca.Models;
using Microsoft.Extensions.Logging;

namespace Brinquedoteca.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoEntradaController : ControllerBase
    {
        private readonly BrinquedotecaDbContext _context;

        public TipoEntradaController(BrinquedotecaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoEntrada>>> Get()
        {
            return await _context.TipoEntrada.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TipoEntrada>> Get(int id)
        {
            var tipo = await _context.TipoEntrada.FindAsync(id);

            if (tipo == null)
                return NotFound();

            return tipo;
        }

        [HttpPost]
        public async Task<ActionResult<TipoEntrada>> Post(TipoEntrada tipo)
        {
            _context.TipoEntrada.Add(tipo);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = tipo.Id }, tipo);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, TipoEntrada tipo)
        {
            if (id != tipo.Id)
                return BadRequest();

            _context.Entry(tipo).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tipo = await _context.TipoEntrada.FindAsync(id);

            if (tipo == null)
                return NotFound();

            _context.TipoEntrada.Remove(tipo);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}