using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Brinquedoteca.Data;
using Brinquedoteca.Models;

namespace Brinquedoteca.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AreaDesenController : ControllerBase
    {
        private readonly BrinquedotecaDbContext _context;

        public AreaDesenController(BrinquedotecaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AreaDesen>>> Get()
        {
            return await _context.AreaDesen.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AreaDesen>> Get(int id)
        {
            var area = await _context.AreaDesen.FindAsync(id);

            if (area == null)
                return NotFound();

            return area;
        }

        [HttpPost]
        public async Task<ActionResult<AreaDesen>> Post(AreaDesen area)
        {
            _context.AreaDesen.Add(area);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = area.Id }, area);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, AreaDesen area)
        {
            if (id != area.Id)
                return BadRequest();

            _context.Entry(area).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var area = await _context.AreaDesen.FindAsync(id);

            if (area == null)
                return NotFound();

            _context.AreaDesen.Remove(area);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}