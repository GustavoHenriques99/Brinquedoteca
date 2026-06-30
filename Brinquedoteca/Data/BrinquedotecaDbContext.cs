using Brinquedoteca.Models;
using Microsoft.EntityFrameworkCore;

//contexto do banco de dados, para gerenciar as entidades e suas relações, além de configurar o acesso ao banco de dados usando Entity Framework Core.
namespace Brinquedoteca.Data
{
    public class BrinquedotecaDbContext : DbContext
    {
        public BrinquedotecaDbContext(DbContextOptions<BrinquedotecaDbContext> options) : base(options)
        {

        }

        public DbSet<Funcionario> Funcionario { get; set; }
        public DbSet<Aluno> Aluno { get; set; }
        public DbSet<Emprestimo> Emprestimo { get; set; }
        public DbSet<Status> Status { get; set; } //Disponivel, Indisponivel, Em Manutenção, Descarte
        public DbSet<Estoque> Estoque { get; set; }
        public DbSet<TipoEntrada> TipoEntrada { get; set; }
        public DbSet<DesenCognitivo> DesenCognitivo { get; set; }
        public DbSet<Item> Item { get; set; }
        public DbSet<AreaDesen> AreaDesen { get; set; }
        public DbSet<Turma> Turma { get; set; }
    }
}
