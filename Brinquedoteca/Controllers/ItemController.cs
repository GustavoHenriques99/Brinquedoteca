using Microsoft.EntityFrameworkCore;
using Brinquedoteca.Data;
using Brinquedoteca.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Brinquedoteca.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly BrinquedotecaDbContext _context;

        public ItemController(BrinquedotecaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Item>>> Get()
        {
            return await _context.Item
                .Include(i => i.DesenCognitivo)
                .Include(i => i.AreaDesen)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Item>> Get(int id)
        {
            var item = await _context.Item
                .Include(i => i.DesenCognitivo)
                .Include(i => i.AreaDesen)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (item == null)
                return NotFound();

            return item;
        }

        [HttpPost]
        public async Task<ActionResult<Item>> Post(Item item)
        {
            _context.Item.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Item item)
        {
            if (id != item.Id)
                return BadRequest();

            _context.Entry(item).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Item.FindAsync(id);

            if (item == null)
                return NotFound();

            _context.Item.Remove(item);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}