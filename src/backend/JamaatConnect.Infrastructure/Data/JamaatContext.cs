using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using JamaatConnect.Domain.Entities;
using JamaatConnect.Application.Interfaces;
using System.Reflection;

namespace JamaatConnect.Infrastructure.Data
{
    public class JamaatContext : IdentityDbContext<User, Role, Guid>, IJamaatContext
    {
        public virtual DbSet<User> Users => Set<User>();
        public virtual DbSet<Role> Roles => Set<Role>();
        public virtual DbSet<Location> Locations => Set<Location>();
        public virtual DbSet<Listing> Listings => Set<Listing>();
        public virtual DbSet<ListingContact> ListingContacts => Set<ListingContact>();
        public virtual DbSet<ListingReport> ListingReports => Set<ListingReport>();
        public virtual DbSet<Enquiry> Enquiries => Set<Enquiry>();
        public virtual DbSet<ModerationAction> ModerationActions => Set<ModerationAction>();
        public virtual DbSet<OrganizerVerification> OrganizerVerifications => Set<OrganizerVerification>();

        public JamaatContext(DbContextOptions<JamaatContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}
