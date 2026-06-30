using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Brinquedoteca.Models
{
    public class Turma
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] //Gera um ID
        [BindNever]
        public int Id { get; set; }


        [StringLength(100)]
        public required string NomeTurma { get; set; }

        public ICollection<Aluno> Alunos { get; set; } = new List<Aluno>();
    }
}