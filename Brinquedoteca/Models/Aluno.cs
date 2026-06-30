using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Brinquedoteca.Models
{
    [Index(nameof(RA), IsUnique = true)]
    public class Aluno
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [BindNever]
        public int Id { get; set; }

        /*  Formato: 0001/26-1
            0001 = sequencial do semestre
            26   = 2 últimos dígitos do ano
            1    = semestre (1 ou 2)
        */
        [BindNever]
        [ScaffoldColumn(false)]
        public string? RA { get; internal set; }

        [Required(ErrorMessage = "O campo nome é obrigatório")]
        [StringLength(20, MinimumLength = 3)]
        public required string Nome { get; set; }

        [Required(ErrorMessage = "O campo Sobrenome é obrigatório")]
        [StringLength(50, MinimumLength = 3)]
        public required string Sobrenome { get; set; }

        [Required(ErrorMessage = "O campo Data de Nascimento é obrigatório")]
        [DataType(DataType.Date)]
        public required DateTime DataNascimento { get; set; }

        [Required(ErrorMessage = "O campo Telefone é obrigatório")]
        [StringLength(20, MinimumLength = 5)]
        public required string Telefone { get; set; }

        [Required(ErrorMessage = "O campo Email é obrigatório")]
        [EmailAddress]
        public required string Email { get; set; }

        [BindNever]
        public DateTime DataCadastro { get; private set; }

        //Foreign key
        public int TurmaId { get; set; }

        //Relacionamento
        public Turma? Turma {get; set;}



        public Aluno()
        {
            DataCadastro = DateTime.UtcNow;
        }

        public void DefinirRA(string ra)
        {
            RA = ra;
        }
    }
}