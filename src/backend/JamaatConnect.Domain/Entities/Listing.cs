using JamaatConnect.Domain.Enums;

namespace JamaatConnect.Domain.Entities
{
    public class Listing : BaseEntity
    {
        public Guid SubmitterUserId { get; private set; }
        public Guid? OrganizerUserId { get; private set; }
        public Guid DepartureLocationId { get; private set; }
        public string Title { get; private set; }
        public string? Description { get; private set; }
        public DateTime? DepartureAt { get; private set; }
        public DateStatus DateStatus { get; private set; }
        public int? DurationDays { get; private set; }
        public Guid? DestinationLocationId { get; private set; }
        public string? DestinationText { get; private set; }
        public PublicationStatus PublicationStatus { get; private set; }
        public VerificationStatus VerificationStatus { get; private set; }
        public string AvailabilityStatus { get; private set; }
        public DateTime? PublishedAt { get; private set; }
        public DateTime? ExpiresAt { get; private set; }

        // Navigation properties (EF Core)
        public User? Submitter { get; private set; }
        public User? Organizer { get; private set; }
        public Location? DepartureLocation { get; private set; }
        public Location? DestinationLocation { get; private set; }
        public ListingContact? ContactInfo { get; private set; }
        public ICollection<Enquiry> Enquiries { get; private set; } = new HashSet<Enquiry>();
        public ICollection<ModerationAction> ModerationActions { get; private set; } = new HashSet<ModerationAction>();
        public ICollection<ListingReport> Reports { get; private set; } = new HashSet<ListingReport>();

        protected Listing() { }

        public Listing(
            Guid submitterUserId,
            Guid departureLocationId,
            string title,
            string? description,
            DateTime? departureAt,
            DateStatus dateStatus,
            int? durationDays,
            Guid? destinationLocationId,
            string? destinationText,
            string availabilityStatus)
        {
            SubmitterUserId = submitterUserId;
            DepartureLocationId = departureLocationId;
            Title = title;
            Description = description;
            DepartureAt = departureAt;
            DateStatus = dateStatus;
            DurationDays = durationDays;
            DestinationLocationId = destinationLocationId;
            DestinationText = destinationText;
            PublicationStatus = PublicationStatus.PendingReview;
            VerificationStatus = VerificationStatus.NotVerified;
            AvailabilityStatus = availabilityStatus;
        }

        public void UpdateBasicInfo(
            string title,
            string? description,
            DateTime? departureAt,
            DateStatus dateStatus,
            int? durationDays,
            Guid? destinationLocationId,
            string? destinationText,
            string availabilityStatus)
        {
            if (PublicationStatus != PublicationStatus.PendingReview &&
                PublicationStatus != PublicationStatus.ChangesRequested)
            {
                throw new InvalidOperationException("Cannot update listing that is not in editable state");
            }

            Title = title;
            Description = description;
            DepartureAt = departureAt;
            DateStatus = dateStatus;
            DurationDays = durationDays;
            DestinationLocationId = destinationLocationId;
            DestinationText = destinationText;
            AvailabilityStatus = availabilityStatus;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetPublicationStatus(PublicationStatus status, DateTime? publishedAt = null)
        {
            PublicationStatus = status;
            if (status == PublicationStatus.Approved && publishedAt.HasValue)
            {
                PublishedAt = publishedAt.Value;
            }
            else if (status == PublicationStatus.Rejected || status == PublicationStatus.Cancelled)
            {
                PublishedAt = null;
            }
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetVerificationStatus(VerificationStatus status)
        {
            VerificationStatus = status;
            UpdatedAt = DateTime.UtcNow;
        }

        public void AssignOrganizer(Guid organizerUserId)
        {
            OrganizerUserId = organizerUserId;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}