using Brinquedoteca.Data;
using Brinquedoteca.Models;
using Brinquedoteca.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Brinquedoteca.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusController : ControllerBase
    {
        private readonly BrinquedotecaDbContext _context;

        public StatusController(BrinquedotecaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Status>>> Get()
        {
            return await _context.Status.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Status>> Get(int id)
        {
            var status = await _context.Status.FindAsync(id);

            if (status == null)
                return NotFound();

            return status;
        }

        [HttpPost]
        public async Task<ActionResult<Status>> Post(Status status)
        {
            _context.Status.Add(status);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = status.Id }, status);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Status status)
        {
            if (id != status.Id)
                return BadRequest();

            _context.Entry(status).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var status = await _context.Status.FindAsync(id);

            if (status == null)
                return NotFound();

            _context.Status.Remove(status);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
