namespace JamaatConnect.Domain.Entities
{
    public class ListingContact : BaseEntity
    {
        public Guid ListingId { get; private set; }
        public Guid? ContactUserId { get; private set; }
        public string PrivatePhone { get; private set; }
        public string? PrivateEmail { get; private set; }
        public string? WhatsAppNumber { get; private set; }
        public string PreferredContactMethod { get; private set; } // Phone, WhatsApp, Email
        public DateTime ConsentRecordedAt { get; private set; }

        protected ListingContact() { } // For EF Core

        public ListingContact(
            Guid listingId,
            Guid? contactUserId,
            string privatePhone,
            string? privateEmail,
            string? whatsAppNumber,
            string preferredContactMethod)
        {
            ListingId = listingId;
            ContactUserId = contactUserId;
            PrivatePhone = privatePhone;
            PrivateEmail = privateEmail;
            WhatsAppNumber = whatsAppNumber;
            PreferredContactMethod = preferredContactMethod;
            ConsentRecordedAt = DateTime.UtcNow;
        }

        public void UpdateContact(
            string privatePhone,
            string? privateEmail,
            string? whatsAppNumber,
            string preferredContactMethod)
        {
            PrivatePhone = privatePhone;
            PrivateEmail = privateEmail;
            WhatsAppNumber = whatsAppNumber;
            PreferredContactMethod = preferredContactMethod;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
