namespace JamaatConnect.Domain.Entities
{
    public class OrganizerVerification : BaseEntity
    {
        public Guid OrganizerUserId { get; private set; }
        public string VerificationMethod { get; private set; }
        public string Status { get; private set; } // Pending, Verified, Rejected, Expired
        public Guid? ReviewedByUserId { get; private set; }
        public DateTime? ReviewedAt { get; private set; }
        public DateTime? ExpiresAt { get; private set; }
        public string? InternalNotes { get; private set; }

        // Navigation
        public User? Organizer { get; private set; }
        public User? Reviewer { get; private set; }

        protected OrganizerVerification() { }

        public OrganizerVerification(
            Guid organizerUserId,
            string verificationMethod,
            string status,
            DateTime? expiresAt = null)
        {
            OrganizerUserId = organizerUserId;
            VerificationMethod = verificationMethod;
            Status = status;
            ExpiresAt = expiresAt;
        }

        public void SetStatus(string status, Guid? reviewedByUserId, string? internalNotes = null)
        {
            Status = status;
            ReviewedByUserId = reviewedByUserId;
            ReviewedAt = DateTime.UtcNow;
            if (internalNotes != null)
            {
                InternalNotes = internalNotes;
            }
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateExpiry(DateTime? expiresAt)
        {
            ExpiresAt = expiresAt;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}