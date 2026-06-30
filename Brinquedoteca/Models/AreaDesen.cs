using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

//entidade de area de desenvolvimento existente no banco
namespace Brinquedoteca.Models
{
    public class AreaDesen
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] //Gera um ID
        [BindNever]
        public int Id { get; set; }

        [StringLength(200)]
        public required string Descricao { get; set; }

    }
}
