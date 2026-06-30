using Brinquedoteca.Data;
using Brinquedoteca.Models;
using Brinquedoteca.Services;
using Microsoft.AspNetCore.Mvc;

namespace Brinquedoteca.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DesenCognitivoController : Controller
    {
        private readonly BrinquedotecaDbContext _context;
        private readonly DesenCognitivoService _desenCognitivoService;

        public DesenCognitivoController(BrinquedotecaDbContext context, DesenCognitivoService desenCognitivoService)
        {
            _context = context;
            _desenCognitivoService = desenCognitivoService;
        }

        [HttpPost]
        public IActionResult PostDesenCognitivo([FromBody] DesenCognitivo desenCognitivo)
        {
            try
            {
                _context.DesenCognitivo.Add(desenCognitivo);
                _context.SaveChanges();
                return Ok(desenCognitivo);
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
        public IActionResult GetDesenCognitivo()
        {
            var result = _context.DesenCognitivo.ToList();
            return Ok(result);

        }

        [HttpGet("{id}")]
        public IActionResult GetDesenCognitivoId(int id)
        {
            var desenCognitivo = _context.DesenCognitivo.Find(id);
            if (desenCognitivo == null)
            {
                return NotFound();
            }
            return Ok(desenCognitivo);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateDesenCognitivo(int id, [FromBody] DesenCognitivo desenCognitivo)
        {
            if (id != desenCognitivo.Id)
            {
                return BadRequest("ID do Desenvolvimento Cognitivo não corresponde ao ID da URL.");
            }
            var existingDesenCognitivo = _context.DesenCognitivo.Find(id);
            if (existingDesenCognitivo == null)
            {
                return NotFound("Desenvolvimento Cognitivo não encontrado.");
            }
            // Atualiza os campos do desenho cognitivo existente
            existingDesenCognitivo.Descricao = desenCognitivo.Descricao;

            _context.SaveChanges();
            return Ok(existingDesenCognitivo);

        }

        [HttpDelete("{id}")]
        public IActionResult DeleteDesenCognitivo(int id)
        {
            var desenCognitivo = _context.DesenCognitivo.Find(id);
            if (desenCognitivo == null)
            {
                return NotFound("Desenvolvimento Cognitivo não encontrado.");
            }
            _context.DesenCognitivo.Remove(desenCognitivo);
            _context.SaveChanges();
            return Ok("Desenvolvimento Cognitivo deletado com sucesso.");
        }
    }
}
