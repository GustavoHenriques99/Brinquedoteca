namespace Brinquedoteca.DTO
{
    public class EmprestimoDTO
    {
        public int FuncionarioId { get; set; } // ID da entidade funcionário responsável pelo empréstimo

        public int AlunoId { get; set; } //ID da entidade Aluno responsável pelo empréstimo

        public int EstoqueId { get; set; } //ID da entidade Estoque responsável pelo empréstimo

        public DateTime DataPrevistaDevolucao { get; set; }
    }
}
