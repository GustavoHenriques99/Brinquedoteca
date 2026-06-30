using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Brinquedoteca.Models
{
    public class Estoque
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] //Gera um ID
        [BindNever]
        public int Id { get; set; }

        public int ItemId { get; set; }
        public int StatusId { get; set; }
        public int TipoEntradaId { get; set; }
        public int FuncionarioId { get; set; }

        public Item? Item { get; set; }
        public Status? Status { get; set; }
        public TipoEntrada? TipoEntrada { get; set; }
        public Funcionario? Funcionario { get; set; }

    }
}
