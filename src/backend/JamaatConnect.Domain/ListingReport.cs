namespace JamaatConnect.Domain.Entities
{
    public class ListingReport : BaseEntity
    {
        public Guid ListingId { get; private set; }
        public Guid? ReporterUserId { get; private set; }
        public string Reason { get; private set; }
        public string Description { get; private set; }
        public string Status { get; private set; } // Pending, Reviewed, ActionTaken, Dismissed

        // Navigation
        public Listing? Listing { get; private set; }
        public User? Reporter { get; private set; }

        protected ListingReport() { }

        public ListingReport(
            Guid listingId,
            Guid? reporterUserId,
            string reason,
            string description)
        {
            ListingId = listingId;
            ReporterUserId = reporterUserId;
            Reason = reason;
            Description = description;
            Status = "Pending";
        }

        public void SetStatus(string status)
        {
            Status = status;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}