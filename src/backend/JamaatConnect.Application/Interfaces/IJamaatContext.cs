using JamaatConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JamaatConnect.Application.Interfaces
{
    public interface IJamaatContext
    {
        DbSet<User> Users { get; }
        DbSet<Role> Roles { get; }
        DbSet<Location> Locations { get; }
        DbSet<Listing> Listings { get; }
        DbSet<ListingContact> ListingContacts { get; }
        DbSet<ListingReport> ListingReports { get; }
        DbSet<Enquiry> Enquiries { get; }
        DbSet<ModerationAction> ModerationActions { get; }
        DbSet<OrganizerVerification> OrganizerVerifications { get; }

        Task<int> SaveChangesAsync(CancellationToken ct = default);
    }
}
