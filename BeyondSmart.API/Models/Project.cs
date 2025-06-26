using System.ComponentModel.DataAnnotations;

namespace BeyondSmart.API.Models
{
    public class Project
    {
        public int Id { get; set; }
        
        [Required]
        public int QuotationId { get; set; }
        
        [Required]
        public int ClientId { get; set; }
        
        [Required]
        public ProjectStatus Status { get; set; } = ProjectStatus.NotStarted;
        
        public DateTime? StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        // Navigation properties
        public Quotation Quotation { get; set; } = null!;
        public Client Client { get; set; } = null!;
        public ICollection<MaintenanceRequest> MaintenanceRequests { get; set; } = new List<MaintenanceRequest>();
    }

    public enum ProjectStatus
    {
        NotStarted,
        Ongoing,
        Completed
    }
}
