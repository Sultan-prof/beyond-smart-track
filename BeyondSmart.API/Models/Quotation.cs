using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BeyondSmart.API.Models
{
    public class Quotation
    {
        public int Id { get; set; }
        
        [Required]
        public int ClientId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string ItemType { get; set; } = string.Empty;
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Area { get; set; }
        
        [Required]
        public int DeviceCount { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal PricePerMeter { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Discount { get; set; } = 0;
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public Client Client { get; set; } = null!;
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}
