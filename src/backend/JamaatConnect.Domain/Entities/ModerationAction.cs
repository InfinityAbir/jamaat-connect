namespace JamaatConnect.Domain.Entities
{
    public class ModerationAction : BaseEntity
    {
        public Guid ListingId { get; private set; }
        public Guid ModeratorUserId { get; private set; }
        public string Action { get; private set; } // Approve, Reject, RequestChanges, Suspend
        public string Reason { get; private set; }

        // Navigation
        public Listing? Listing { get; private set; }
        public User? Moderator { get; private set; }

        protected ModerationAction() { } // For EF Core

        public ModerationAction(Guid listingId, Guid moderatorUserId, string action, string reason)
        {
            ListingId = listingId;
            ModeratorUserId = moderatorUserId;
            Action = action;
            Reason = reason;
        }
    }
}