namespace JamaatConnect.Domain.Entities
{
    public class Enquiry : BaseEntity
    {
        public Guid ListingId { get; private set; }
        public Guid? SenderUserId { get; private set; }
        public string SenderName { get; private set; }
        public string? SenderPhone { get; private set; }
        public string? SenderWhatsApp { get; private set; }
        public bool ContactSharingConsent { get; private set; }
        public string Message { get; private set; }
        public string Status { get; private set; } // Pending, Contacted, Cancelled, Junk
        public DateTime? RetentionUntil { get; private set; }

        // Navigation
        public Listing? Listing { get; private set; }
        public User? SenderUser { get; private set; }

        protected Enquiry() { } // For EF Core

        public Enquiry(
            Guid listingId,
            Guid? senderUserId,
            string senderName,
            string? senderPhone,
            string? senderWhatsApp,
            bool contactSharingConsent,
            string message,
            DateTime? retentionUntil = null)
        {
            ListingId = listingId;
            SenderUserId = senderUserId;
            SenderName = senderName;
            SenderPhone = senderPhone;
            SenderWhatsApp = senderWhatsApp;
            ContactSharingConsent = contactSharingConsent;
            Message = message;
            Status = "Pending";
            RetentionUntil = retentionUntil;
        }

        public void SetStatus(string status)
        {
            Status = status;
            UpdatedAt = DateTime.UtcNow;
        }

        public void ExtendRetention(DateTime extension)
        {
            RetentionUntil = extension;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}