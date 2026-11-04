using System.ComponentModel.DataAnnotations;

namespace JamaatConnect.Application.DTOs
{
    public record ListingSearchRequest(
        [Range(1, int.MaxValue)] int Page = 1,
        [Range(1, 100)] int PageSize = 12,
        string? LocationId = null,
        DateTime? DepartureDateFrom = null,
        DateTime? DepartureDateTo = null,
        int? DurationDays = null,
        string? AvailabilityStatus = null,
        string? SortBy = "departureAt",
        string? SortDirection = "asc"
    );

    public record PagedResult<T>(
        IReadOnlyList<T> Items,
        int Page,
        int PageSize,
        int TotalCount,
        int TotalPages
    )
    {
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }

    public record ListingSummaryDto(
        Guid Id,
        string Title,
        string DepartureLocationName,
        DateTime? DepartureAt,
        int? DurationDays,
        string DestinationText,
        string AvailabilityStatus,
        string VerificationStatus,
        DateTime? PublishedAt
    );

    public record ListingDetailDto(
        Guid Id,
        string Title,
        string? Description,
        string DepartureLocationName,
        Guid DepartureLocationId,
        DateTime? DepartureAt,
        int? DurationDays,
        string? DestinationLocationName,
        Guid? DestinationLocationId,
        string? DestinationText,
        string AvailabilityStatus,
        string PublicationStatus,
        string VerificationStatus,
        DateTime? PublishedAt,
        DateTime? ExpiresAt,
        DateTime CreatedAt,
        DateTime? UpdatedAt,
        bool CanEnquire,
        bool CanReport
    );

    public record CreateListingRequest(
        [Required] Guid DepartureLocationId,
        [Required] [StringLength(200)] string Title,
        [StringLength(2000)] string? Description,
        DateTime? DepartureAt,
        [Required] string DateStatus,
        int? DurationDays,
        Guid? DestinationLocationId,
        [StringLength(200)] string? DestinationText,
        [Required] string AvailabilityStatus,
        [Required] string SubmitterName,
        [Required] [Phone] string SubmitterPhone,
        [EmailAddress] string? SubmitterEmail,
        string? WhatsAppNumber,
        [Required] string PreferredContactMethod,
        bool ConsentToShareContact
    );

    public record UpdateListingRequest(
        [Required] [StringLength(200)] string Title,
        [StringLength(2000)] string? Description,
        DateTime? DepartureAt,
        [Required] string DateStatus,
        int? DurationDays,
        Guid? DestinationLocationId,
        [StringLength(200)] string? DestinationText,
        [Required] string AvailabilityStatus
    );

    public record ListingSubmissionResponse(
        Guid SubmissionId,
        string ReferenceNumber,
        string Status
    );

    public record ListingModerationActionRequest(
        [Required] string Action, // "Approve", "RequestChanges", "Reject", "Suspend"
        string? Reason
    );

    public record ModerationQueueItemDto(
        Guid Id,
        string Title,
        string DepartureLocationName,
        DateTime? DepartureAt,
        int? DurationDays,
        string PublicationStatus,
        string VerificationStatus,
        string SubmitterName,
        string SubmitterPhone,
        string? SubmitterEmail,
        string? WhatsAppNumber,
        string PreferredContactMethod,
        Guid SubmitterUserId,
        DateTime CreatedAt
    );

    public record CreateListingReportRequest(
        [Required] Guid ListingId,
        [Required] [StringLength(100)] string Reason,
        [Required] [StringLength(2000)] string Description
    );

    public record ListingReportDto(
        Guid Id,
        Guid ListingId,
        string ListingTitle,
        string Reason,
        string Description,
        string Status,
        DateTime CreatedAt
    );

    public record OrganizerVerificationDto(
        Guid Id,
        Guid OrganizerUserId,
        string OrganizerName,
        string VerificationMethod,
        string Status,
        DateTime? ExpiresAt,
        string? InternalNotes,
        DateTime CreatedAt
    );

    public record VerifyOrganizerRequest(
        [Required] Guid OrganizerUserId,
        [Required] string VerificationMethod,
        [Required] string Status, // "Approved", "Rejected", "Pending"
        DateTime? ExpiresAt,
        string? InternalNotes
    );
}
