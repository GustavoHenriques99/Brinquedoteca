using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Brinquedoteca.Models
{
    public class Status
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] //Gera um ID
        [BindNever]
        public int Id { get; set; }

   
        [StringLength(50)]
        public required string Descricao { get; set; }


    }

    
}