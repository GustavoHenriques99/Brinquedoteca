using Brinquedoteca.Data;

namespace Brinquedoteca.Services
{
    public class DesenCognitivoService
    {
        private readonly BrinquedotecaDbContext _context; 

        public DesenCognitivoService(BrinquedotecaDbContext context)
        {
            _context = context;
        }

    }
}
