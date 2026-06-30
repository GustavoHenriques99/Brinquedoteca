using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Brinquedoteca.Models
{
    public class Funcionario
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] //Gera um ID
        [BindNever]
        public int Id { get; set; }

        [Required(ErrorMessage = "O campo nome é obrigatório")]
        [StringLength(200, MinimumLength = 3, ErrorMessage = "O Campo nome deve ter entre 3 a 200 caracteres")]
        public required string Nome { get; set; }

        [Required(ErrorMessage = "O campo Sobrenome é obrigatório")]
        [StringLength(200, MinimumLength = 3, ErrorMessage = "O Campo Sobrenome deve ter entre 3 a 200 caracteres")]
        public required string Sobrenome { get; set; }
        
        [Required(ErrorMessage = "O campo Telefone é obrigatório")]
        [StringLength(15, MinimumLength = 8, ErrorMessage = "O Campo Sobrenome deve ter entre 3 a 200 caracteres")]
        public required string Telefone { get; set; }

        [EmailAddress]
        [Required(ErrorMessage = "O campo Email é obrigatório")]
        public required string Email { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime DataCadastro { get; set; }

        [Required(ErrorMessage = "O campo Login é obrigatório")]
        [StringLength(50, MinimumLength = 5, ErrorMessage = "O Campo Login deve ter entre 3 a 200 caracteres")]
        public required string Login { get; set; }

        [Required(ErrorMessage = "O campo Senha é obrigatório")]
        [StringLength(200, MinimumLength = 3, ErrorMessage = "O Campo Senha deve ter entre 3 a 200 caracteres")]
        public required string Senha { get; set; }


    }
}
