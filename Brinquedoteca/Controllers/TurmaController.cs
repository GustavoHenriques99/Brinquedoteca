using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Brinquedoteca.Data;
using Brinquedoteca.Models;
using Microsoft.Extensions.Logging;

namespace Brinquedoteca.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TurmaController : ControllerBase
    {
        private readonly BrinquedotecaDbContext _context;

        public TurmaController(BrinquedotecaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Turma>>> Get()
        {
            return await _context.Turma.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Turma>> Get(int id)
        {
            var turma = await _context.Turma.FindAsync(id);

            if (turma == null)
                return NotFound();

            return turma;
        }

        [HttpPost]
        public async Task<ActionResult<Turma>> Post(Turma turma)
        {
            _context.Turma.Add(turma);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = turma.Id }, turma);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Turma turma)
        {
            if (id != turma.Id)
                return BadRequest();

            _context.Entry(turma).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var turma = await _context.Turma.FindAsync(id);

            if (turma == null)
                return NotFound();

            _context.Turma.Remove(turma);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}