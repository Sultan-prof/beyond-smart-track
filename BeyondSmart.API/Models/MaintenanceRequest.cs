using System.ComponentModel.DataAnnotations;

namespace BeyondSmart.API.Models
{
    public class MaintenanceRequest
    {
        public int Id { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public Project Project { get; set; } = null!;
    }
}
