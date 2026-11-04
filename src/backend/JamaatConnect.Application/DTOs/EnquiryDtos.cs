using System.ComponentModel.DataAnnotations;

namespace JamaatConnect.Application.DTOs
{
    public record CreateEnquiryRequest(
        [Required] Guid ListingId,
        [Required] [StringLength(100)] string SenderName,
        [StringLength(20)] string? SenderPhone,
        [StringLength(20)] string? SenderWhatsApp,
        bool ConsentToShareContact,
        [Required] [StringLength(1000)] string Message
    );

    public record EnquiryResponse(
        Guid EnquiryId,
        string Status,
        DateTime CreatedAt
    );

    public record EnquiryDetailDto(
        Guid Id,
        Guid ListingId,
        string ListingTitle,
        string SenderName,
        string? SenderPhone,
        string? SenderWhatsApp,
        bool ConsentToShareContact,
        string Message,
        string Status,
        DateTime CreatedAt
    );

    public record EnquirySearchRequest(
        [Range(1, int.MaxValue)] int Page = 1,
        [Range(1, 100)] int PageSize = 12,
        Guid? ListingId = null,
        string? Status = null,
        DateTime? CreatedFrom = null,
        DateTime? CreatedTo = null
    );

    public record EnquiryModerationAction(
        [Required] Guid EnquiryId,
        [Required] string Action, // "MarkContacted", "MarkJunk", "Archive"
        string? Reason
    );
}