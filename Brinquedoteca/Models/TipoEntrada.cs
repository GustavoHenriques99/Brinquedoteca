using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Brinquedoteca.Models
{
    public class TipoEntrada
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] //Gera um ID
        [BindNever]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string? Entrada { get; set; }
    }
}
