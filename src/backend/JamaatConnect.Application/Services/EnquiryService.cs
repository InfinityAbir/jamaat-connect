using JamaatConnect.Application.Common;
using JamaatConnect.Application.DTOs;
using JamaatConnect.Application.Interfaces;
using JamaatConnect.Domain.Entities;
using JamaatConnect.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace JamaatConnect.Application.Services
{
    public class EnquiryService : IEnquiryService
    {
        private readonly IJamaatContext _db;
        private readonly IDateTimeProvider _dt;
        private readonly ICurrentUserService _currentUser;

        public EnquiryService(IJamaatContext db, IDateTimeProvider dt, ICurrentUserService currentUser)
        {
            _db = db;
            _dt = dt;
            _currentUser = currentUser;
        }

        public async Task<Result<EnquiryResponse>> CreateEnquiryAsync(CreateEnquiryRequest request, CancellationToken ct = default)
        {
            // Verify listing exists and is published
            var listing = await _db.Listings
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == request.ListingId && l.PublicationStatus == PublicationStatus.Approved, ct);

            if (listing == null)
            {
                return Result<EnquiryResponse>.NotFound("Listing not found or not available for enquiries");
            }

            var enquiry = new Enquiry(
                request.ListingId,
                _currentUser.UserId,
                request.SenderName,
                request.SenderPhone,
                request.SenderWhatsApp,
                request.ConsentToShareContact,
                request.Message
            );

            _db.Enquiries.Add(enquiry);
            await _db.SaveChangesAsync(ct);

            return Result<EnquiryResponse>.Success(new EnquiryResponse(
                enquiry.Id,
                enquiry.Status,
                enquiry.CreatedAt
            ));
        }

        public async Task<Result<PagedResult<EnquiryDetailDto>>> SearchEnquiriesAsync(EnquirySearchRequest request, CancellationToken ct = default)
        {
            var query = _db.Enquiries
                .AsNoTracking()
                .Include(e => e.Listing)
                .AsQueryable();

            if (request.ListingId.HasValue)
                query = query.Where(e => e.ListingId == request.ListingId.Value);

            if (!string.IsNullOrEmpty(request.Status))
                query = query.Where(e => e.Status == request.Status);

            if (request.CreatedFrom.HasValue)
                query = query.Where(e => e.CreatedAt >= request.CreatedFrom.Value);

            if (request.CreatedTo.HasValue)
                query = query.Where(e => e.CreatedAt <= request.CreatedTo.Value);

            query = query.OrderByDescending(e => e.CreatedAt);

            var totalCount = await query.CountAsync(ct);
            var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(e => new EnquiryDetailDto(
                    e.Id,
                    e.ListingId,
                    e.Listing!.Title,
                    e.SenderName,
                    e.SenderPhone,
                    e.SenderWhatsApp,
                    e.ContactSharingConsent,
                    e.Message,
                    e.Status,
                    e.CreatedAt
                ))
                .ToListAsync(ct);

            return Result<PagedResult<EnquiryDetailDto>>.Success(
                new PagedResult<EnquiryDetailDto>(items, request.Page, request.PageSize, totalCount, totalPages));
        }

        public async Task<Result<EnquiryDetailDto>> GetEnquiryAsync(Guid id, CancellationToken ct = default)
        {
            var enquiry = await _db.Enquiries
                .AsNoTracking()
                .Include(e => e.Listing)
                .FirstOrDefaultAsync(e => e.Id == id, ct);

            if (enquiry == null)
                return Result<EnquiryDetailDto>.NotFound("Enquiry not found");

            var dto = new EnquiryDetailDto(
                enquiry.Id,
                enquiry.ListingId,
                enquiry.Listing!.Title,
                enquiry.SenderName,
                enquiry.SenderPhone,
                enquiry.SenderWhatsApp,
                enquiry.ContactSharingConsent,
                enquiry.Message,
                enquiry.Status,
                enquiry.CreatedAt
            );

            return Result<EnquiryDetailDto>.Success(dto);
        }

        public async Task<Result> ModerateEnquiryAsync(EnquiryModerationAction action, CancellationToken ct = default)
        {
            var enquiry = await _db.Enquiries.FindAsync(new object[] { action.EnquiryId }, ct);
            if (enquiry == null)
                return Result.NotFound("Enquiry not found");

            if (action.Action == "MarkContacted" && enquiry.Status == "Pending")
            {
                enquiry.SetStatus("Contacted");
            }
            else if (action.Action == "MarkJunk" && enquiry.Status == "Pending")
            {
                enquiry.SetStatus("Junk");
            }
            else if (action.Action == "Archive" && (enquiry.Status == "Contacted" || enquiry.Status == "Junk"))
            {
                enquiry.SetStatus("Archived");
            }
            else
            {
                return Result.ValidationFailed("Invalid action for current status");
            }

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
    }
}