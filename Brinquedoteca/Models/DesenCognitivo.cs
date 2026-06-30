using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Brinquedoteca.Models
{
    public class DesenCognitivo
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] //Gera um ID
        [BindNever]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public required string Descricao { get; set; }
    }
}
