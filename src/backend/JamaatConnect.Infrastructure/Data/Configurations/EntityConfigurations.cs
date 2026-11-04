using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using JamaatConnect.Domain.Entities;

namespace JamaatConnect.Infrastructure.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("users");
            builder.Property(u => u.DisplayName).IsRequired().HasMaxLength(100);
            builder.Property(u => u.PhonePrivate).HasMaxLength(20);
            builder.Property(u => u.AccountStatus).HasConversion<string>();
            builder.Property(u => u.RefreshToken).HasMaxLength(500);
            builder.Property(u => u.CreatedAt).IsRequired();
            builder.Property(u => u.UpdatedAt);
        }
    }

    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder.ToTable("roles");
            builder.Property(r => r.Description).HasMaxLength(500);
            builder.Property(r => r.IsSystemRole).HasDefaultValue(false);
            builder.Property(r => r.CreatedAt).IsRequired();
            builder.Property(r => r.UpdatedAt);
        }
    }

    public class LocationConfiguration : IEntityTypeConfiguration<Location>
    {
        public void Configure(EntityTypeBuilder<Location> builder)
        {
            builder.ToTable("locations");
            builder.HasKey(l => l.Id);
            builder.Property(l => l.Name).IsRequired().HasMaxLength(100);
            builder.Property(l => l.StableIdentifier).HasMaxLength(50);
            builder.HasIndex(l => l.StableIdentifier).IsUnique();
            builder.Property(l => l.Level).IsRequired();
            builder.Property(l => l.IsActive).HasDefaultValue(true);

            builder.HasOne(l => l.ParentLocation)
                .WithMany(pl => pl.ChildLocations)
                .HasForeignKey(l => l.ParentLocationId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(l => l.ParentLocationId);
            builder.HasIndex(l => l.Level);
        }
    }

    public class ListingConfiguration : IEntityTypeConfiguration<Listing>
    {
        public void Configure(EntityTypeBuilder<Listing> builder)
        {
            builder.ToTable("listings");
            builder.HasKey(l => l.Id);
            builder.Property(l => l.Title).IsRequired().HasMaxLength(200);
            builder.Property(l => l.Description).HasMaxLength(2000);
            builder.Property(l => l.PublicationStatus).HasConversion<string>().IsRequired();
            builder.Property(l => l.VerificationStatus).HasConversion<string>().IsRequired();
            builder.Property(l => l.DateStatus).HasConversion<string>().IsRequired();
            builder.Property(l => l.AvailabilityStatus).HasMaxLength(50).IsRequired();

            builder.HasOne(l => l.Submitter)
                .WithMany(u => u.SubmittedListings)
                .HasForeignKey(l => l.SubmitterUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(l => l.Organizer)
                .WithMany(u => u.OrganizedListings)
                .HasForeignKey(l => l.OrganizerUserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(l => l.DepartureLocation)
                .WithMany()
                .HasForeignKey(l => l.DepartureLocationId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(l => l.DestinationLocation)
                .WithMany()
                .HasForeignKey(l => l.DestinationLocationId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(l => l.ContactInfo)
                .WithOne()
                .HasForeignKey<ListingContact>(lc => lc.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(l => l.DepartureLocationId);
            builder.HasIndex(l => l.DepartureAt);
            builder.HasIndex(l => l.PublicationStatus);
            builder.HasIndex(l => l.VerificationStatus);
            builder.HasIndex(l => l.ExpiresAt);
        }
    }

    public class ListingContactConfiguration : IEntityTypeConfiguration<ListingContact>
    {
        public void Configure(EntityTypeBuilder<ListingContact> builder)
        {
            builder.ToTable("listing_contacts");
            builder.HasKey(lc => lc.Id);
            builder.Property(lc => lc.PrivatePhone).IsRequired().HasMaxLength(20);
            builder.Property(lc => lc.PrivateEmail).HasMaxLength(255);
            builder.Property(lc => lc.WhatsAppNumber).HasMaxLength(20);
            builder.Property(lc => lc.PreferredContactMethod).HasMaxLength(20).IsRequired();
            builder.Property(lc => lc.ConsentRecordedAt).IsRequired();

            builder.HasOne<Listing>()
                .WithOne(l => l.ContactInfo)
                .HasForeignKey<ListingContact>(lc => lc.ListingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class ListingReportConfiguration : IEntityTypeConfiguration<ListingReport>
    {
        public void Configure(EntityTypeBuilder<ListingReport> builder)
        {
            builder.ToTable("listing_reports");
            builder.HasKey(lr => lr.Id);
            builder.Property(lr => lr.Reason).IsRequired().HasMaxLength(100);
            builder.Property(lr => lr.Description).IsRequired().HasMaxLength(2000);
            builder.Property(lr => lr.Status).HasMaxLength(20).IsRequired().HasDefaultValue("Pending");

            builder.HasOne(lr => lr.Listing)
                .WithMany(l => l.Reports)
                .HasForeignKey(lr => lr.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(lr => lr.Reporter)
                .WithMany(u => u.Reports)
                .HasForeignKey(lr => lr.ReporterUserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(lr => lr.ListingId);
            builder.HasIndex(lr => lr.Status);
        }
    }

    public class EnquiryConfiguration : IEntityTypeConfiguration<Enquiry>
    {
        public void Configure(EntityTypeBuilder<Enquiry> builder)
        {
            builder.ToTable("enquiries");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.SenderName).IsRequired().HasMaxLength(100);
            builder.Property(e => e.SenderPhone).HasMaxLength(20);
            builder.Property(e => e.SenderWhatsApp).HasMaxLength(20);
            builder.Property(e => e.Message).IsRequired().HasMaxLength(1000);
            builder.Property(e => e.Status).HasMaxLength(20).IsRequired().HasDefaultValue("Pending");
            builder.Property(e => e.ContactSharingConsent).IsRequired().HasDefaultValue(false);

            builder.HasOne(e => e.Listing)
                .WithMany(l => l.Enquiries)
                .HasForeignKey(e => e.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.SenderUser)
                .WithMany(u => u.SentEnquiries)
                .HasForeignKey(e => e.SenderUserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(e => e.ListingId);
            builder.HasIndex(e => e.SenderUserId);
            builder.HasIndex(e => e.Status);
        }
    }

    public class ModerationActionConfiguration : IEntityTypeConfiguration<ModerationAction>
    {
        public void Configure(EntityTypeBuilder<ModerationAction> builder)
        {
            builder.ToTable("moderation_actions");
            builder.HasKey(ma => ma.Id);
            builder.Property(ma => ma.Action).IsRequired().HasMaxLength(50);
            builder.Property(ma => ma.Reason).IsRequired().HasMaxLength(1000);

            builder.HasOne(ma => ma.Listing)
                .WithMany(l => l.ModerationActions)
                .HasForeignKey(ma => ma.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ma => ma.Moderator)
                .WithMany(u => u.ModerationActions)
                .HasForeignKey(ma => ma.ModeratorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(ma => ma.ListingId);
            builder.HasIndex(ma => ma.ModeratorUserId);
        }
    }

    public class OrganizerVerificationConfiguration : IEntityTypeConfiguration<OrganizerVerification>
    {
        public void Configure(EntityTypeBuilder<OrganizerVerification> builder)
        {
            builder.ToTable("organizer_verifications");
            builder.HasKey(ov => ov.Id);
            builder.Property(ov => ov.VerificationMethod).IsRequired().HasMaxLength(100);
            builder.Property(ov => ov.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
            builder.Property(ov => ov.InternalNotes).HasMaxLength(2000);

            builder.HasOne(ov => ov.Organizer)
                .WithMany(u => u.Verifications)
                .HasForeignKey(ov => ov.OrganizerUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ov => ov.Reviewer)
                .WithMany()
                .HasForeignKey(ov => ov.ReviewedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(ov => ov.OrganizerUserId);
            builder.HasIndex(ov => ov.Status);
        }
    }
}