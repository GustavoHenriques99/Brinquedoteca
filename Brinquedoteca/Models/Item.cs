using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Brinquedoteca.Models
{
    public class Item
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] //Gera um ID
        [BindNever]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public required string Tipo { get; set; }// tipo do item ex: brinquedo, jogo, livro.

        [Required]
        [StringLength(100)]
        public required string Descricao { get; set; }// tipo do Bola, boneca, jogo de tabuleiro, livro de colorir.

        [Required]                                                                                                                          
        [StringLength(10)]
        public required string FaixaEtaria { get; set; }// +3, +5, +10, todas as Idades.



        //[ForeignKey("DesenCognitivo")] 
        public int DesenCognitivoId { get; set; } //Relacionamento com a tabela Desenho Cognitivo

        //[ForeignKey("AreaDesen")]
        public int AreaDesenId { get; set; } //Relacionamento com a tabela Área de Desenho



        public DesenCognitivo? DesenCognitivo { get; set; } //Propriedade de navegação para acessar os detalhes do Desenho Cognitivo
        public AreaDesen? AreaDesen { get; set; } //Propriedade de navegação para acessar os detalhes da Área de Desenho


    }
}
