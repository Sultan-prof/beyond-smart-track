using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BeyondSmart.API.Models
{
    public class InventoryItem
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string ProductName { get; set; } = string.Empty;
        
        [Required]
        public InventoryUnit Unit { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantity { get; set; }
    }

    public enum InventoryUnit
    {
        sqm,  // Square meters
        pcs   // Pieces
    }
}
