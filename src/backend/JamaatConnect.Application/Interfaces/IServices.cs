using System.ComponentModel.DataAnnotations;
using JamaatConnect.Application.Common;
using JamaatConnect.Application.DTOs;

namespace JamaatConnect.Application.Interfaces
{
    public interface IListingService
    {
        Task<Result<PagedResult<ListingSummaryDto>>> SearchListingsAsync(ListingSearchRequest request, CancellationToken ct = default);
        Task<Result<ListingDetailDto>> GetListingAsync(Guid id, CancellationToken ct = default);
        Task<Result<ListingSubmissionResponse>> CreateListingAsync(CreateListingRequest request, CancellationToken ct = default);
        Task<Result> UpdateListingAsync(Guid id, UpdateListingRequest request, Guid userId, CancellationToken ct = default);
        Task<Result> WithdrawListingAsync(Guid id, Guid userId, CancellationToken ct = default);
        Task<Result<IReadOnlyList<ListingSummaryDto>>> GetUserSubmissionsAsync(Guid userId, CancellationToken ct = default);
    }

    public interface IEnquiryService
    {
        Task<Result<EnquiryResponse>> CreateEnquiryAsync(CreateEnquiryRequest request, CancellationToken ct = default);
        Task<Result<PagedResult<EnquiryDetailDto>>> SearchEnquiriesAsync(EnquirySearchRequest request, CancellationToken ct = default);
        Task<Result<EnquiryDetailDto>> GetEnquiryAsync(Guid id, CancellationToken ct = default);
        Task<Result> ModerateEnquiryAsync(EnquiryModerationAction action, CancellationToken ct = default);
    }

    public interface IModerationService
    {
        Task<Result<PagedResult<ModerationQueueItemDto>>> GetModerationQueueAsync(int page = 1, int pageSize = 20, CancellationToken ct = default);
        Task<Result> ApproveListingAsync(Guid listingId, Guid moderatorUserId, string reason, CancellationToken ct = default);
        Task<Result> RequestChangesAsync(Guid listingId, Guid moderatorUserId, string reason, CancellationToken ct = default);
        Task<Result> RejectListingAsync(Guid listingId, Guid moderatorUserId, string reason, CancellationToken ct = default);
        Task<Result> SuspendListingAsync(Guid listingId, Guid moderatorUserId, string reason, CancellationToken ct = default);
    }

    public interface IReportService
    {
        Task<Result<ListingReportDto>> CreateReportAsync(CreateListingReportRequest request, Guid? reporterUserId, CancellationToken ct = default);
        Task<Result<PagedResult<ListingReportDto>>> GetReportsAsync(int page = 1, int pageSize = 20, string? status = null, CancellationToken ct = default);
        Task<Result> ResolveReportAsync(Guid reportId, Guid moderatorUserId, string reason, CancellationToken ct = default);
    }

    public interface IOrganizerVerificationService
    {
        Task<Result<IReadOnlyList<OrganizerVerificationDto>>> GetVerificationsAsync(string? status = null, CancellationToken ct = default);
        Task<Result<OrganizerVerificationDto>> VerifyOrganizerAsync(VerifyOrganizerRequest request, Guid reviewerUserId, CancellationToken ct = default);
    }

    public interface ILocationService
    {
        Task<Result<IReadOnlyList<LocationDto>>> GetLocationsAsync(Guid? parentId = null, CancellationToken ct = default);
        Task<Result<LocationDto>> GetLocationAsync(Guid id, CancellationToken ct = default);
        Task<Result<LocationDto>> CreateLocationAsync(CreateLocationRequest request, CancellationToken ct = default);
        Task<Result<LocationDto>> UpdateLocationAsync(Guid id, UpdateLocationRequest request, CancellationToken ct = default);
        Task<Result> DeleteLocationAsync(Guid id, CancellationToken ct = default);
    }

    public record LocationDto(Guid Id, string Name, string? StableIdentifier, int Level, Guid? ParentId, bool IsActive);
    public record CreateLocationRequest([Required] string Name, string? StableIdentifier, [Required] int Level, Guid? ParentId);
    public record UpdateLocationRequest([Required] string Name, string? StableIdentifier, bool IsActive);
}

namespace JamaatConnect.Application.Interfaces
{
    public interface ISmtpEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlBody, string? textBody = null);
        Task SendListingStatusUpdateAsync(string toEmail, string displayName, string listingTitle, string status, string? reason = null);
    }
}