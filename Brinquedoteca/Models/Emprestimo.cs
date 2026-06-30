using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;

namespace Brinquedoteca.Models
{
    public class Emprestimo
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [BindNever]
        public int Id { get; set; }

        // DATA EMPRÉSTIMO
        [DataType(DataType.Date)]
        [BindNever]
        public DateTime DataEmprestimo { get; set; }


        // DATA DEVOLUÇÃO
        [DataType(DataType.Date)]
        public DateTime? DataDevolucao { get; set; }


        // PREVISÃO DEVOLUÇÃO
        [Required]
        [DataType(DataType.Date)]
        public DateTime DataPrevistaDevolucao { get; set; }


        // CONTROLE
        public bool Finalizado { get; set; } = false;


        // FOREIGN KEYs
        public int FuncionarioId { get; set; }
        public int AlunoId { get; set; }
        public int EstoqueId { get; set; }


        // RELACIONAMENTOS
            //? Usado para correção da obrogatoriedade de preenchimento durante o empestimo.
        public Funcionario? Funcionario { get; set; }
        public Aluno? Aluno { get; set; }
        public Estoque? Estoque { get; set; }


        // CONSTRUTOR
        public Emprestimo()
        {
            DataEmprestimo = DateTime.UtcNow;
        }
    }
}