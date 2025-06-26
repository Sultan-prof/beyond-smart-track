using Microsoft.EntityFrameworkCore;
using BeyondSmart.API.Models;

namespace BeyondSmart.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Quotation> Quotations { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<InventoryItem> InventoryItems { get; set; }
        public DbSet<MaintenanceRequest> MaintenanceRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Role).HasConversion<string>();
            });

            // Configure Client entity
            modelBuilder.Entity<Client>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Configure Quotation entity
            modelBuilder.Entity<Quotation>(entity =>
            {
                entity.HasOne(q => q.Client)
                    .WithMany(c => c.Quotations)
                    .HasForeignKey(q => q.ClientId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Project entity
            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasOne(p => p.Quotation)
                    .WithMany(q => q.Projects)
                    .HasForeignKey(p => p.QuotationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Client)
                    .WithMany(c => c.Projects)
                    .HasForeignKey(p => p.ClientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Status).HasConversion<string>();
            });

            // Configure InventoryItem entity
            modelBuilder.Entity<InventoryItem>(entity =>
            {
                entity.Property(e => e.Unit).HasConversion<string>();
            });

            // Configure MaintenanceRequest entity
            modelBuilder.Entity<MaintenanceRequest>(entity =>
            {
                entity.HasOne(mr => mr.Project)
                    .WithMany(p => p.MaintenanceRequests)
                    .HasForeignKey(mr => mr.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
