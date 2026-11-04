using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using JamaatConnect.Domain.Enums;

namespace JamaatConnect.Domain.Entities
{
    public class User : IdentityUser<Guid>
    {
        public string DisplayName { get; set; }
        public string? PhonePrivate { get; set; }
        public AccountStatus AccountStatus { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
        public virtual ICollection<Listing> SubmittedListings { get; set; } = new HashSet<Listing>();
        public virtual ICollection<Listing> OrganizedListings { get; set; } = new HashSet<Listing>();
        public virtual ICollection<Enquiry> SentEnquiries { get; set; } = new HashSet<Enquiry>();
        public virtual ICollection<ListingReport> Reports { get; set; } = new HashSet<ListingReport>();
        public virtual ICollection<OrganizerVerification> Verifications { get; set; } = new HashSet<OrganizerVerification>();
        public virtual ICollection<ModerationAction> ModerationActions { get; set; } = new HashSet<ModerationAction>();

        protected User() : base() { }

        public User(string displayName, string email, string? phonePrivate = null) : base()
        {
            Id = Guid.NewGuid();
            DisplayName = displayName;
            Email = email;
            PhonePrivate = phonePrivate;
            AccountStatus = AccountStatus.Active;
            UserName = email;
            NormalizedEmail = email.ToUpper();
            CreatedAt = DateTime.UtcNow;
        }

        public void UpdateProfile(string displayName, string? phonePrivate)
        {
            DisplayName = displayName;
            PhonePrivate = phonePrivate;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetPasswordHash(string passwordHash)
        {
            PasswordHash = passwordHash;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetRefreshToken(string? refreshToken, DateTime? expiry)
        {
            RefreshToken = refreshToken;
            RefreshTokenExpiry = expiry;
            UpdatedAt = DateTime.UtcNow;
        }

        public void ClearRefreshToken()
        {
            RefreshToken = null;
            RefreshTokenExpiry = null;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Deactivate()
        {
            AccountStatus = AccountStatus.Inactive;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Activate()
        {
            AccountStatus = AccountStatus.Active;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}