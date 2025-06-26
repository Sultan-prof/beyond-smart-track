using System.ComponentModel.DataAnnotations;

namespace BeyondSmart.API.Models
{
    public class Client
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [Phone]
        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string City { get; set; } = string.Empty;
        
        // Navigation properties
        public ICollection<Quotation> Quotations { get; set; } = new List<Quotation>();
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}
