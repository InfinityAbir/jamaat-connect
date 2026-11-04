using JamaatConnect.Application.Common;
using JamaatConnect.Application.DTOs;
using JamaatConnect.Application.Interfaces;
using JamaatConnect.Domain.Entities;
using JamaatConnect.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace JamaatConnect.Application.Services
{
    public class ListingService : IListingService
    {
        private readonly IJamaatContext _db;
        private readonly IDateTimeProvider _dt;
        private readonly ILogger<ListingService> _log;

        public ListingService(IJamaatContext db, IDateTimeProvider dt, ILogger<ListingService> log)
        {
            _db = db;
            _dt = dt;
            _log = log;
        }

        public async Task<Result<PagedResult<ListingSummaryDto>>> SearchListingsAsync(ListingSearchRequest request, CancellationToken ct = default)
        {
            var query = _db.Listings
                .AsNoTracking()
                .Where(l => l.PublicationStatus == PublicationStatus.Approved
                    && (l.ExpiresAt == null || l.ExpiresAt > _dt.UtcNow)
                    && l.AvailabilityStatus != "Cancelled");

            if (!string.IsNullOrEmpty(request.LocationId) && Guid.TryParse(request.LocationId, out var locId))
            {
                query = query.Where(l => l.DepartureLocationId == locId
                    || l.DestinationLocationId == locId);
            }

            if (request.DepartureDateFrom.HasValue)
                query = query.Where(l => l.DepartureAt >= request.DepartureDateFrom.Value);

            if (request.DepartureDateTo.HasValue)
                query = query.Where(l => l.DepartureAt <= request.DepartureDateTo.Value);

            if (request.DurationDays.HasValue)
                query = query.Where(l => l.DurationDays == request.DurationDays.Value);

            if (!string.IsNullOrEmpty(request.AvailabilityStatus))
                query = query.Where(l => l.AvailabilityStatus == request.AvailabilityStatus);

            var sortBy = request.SortBy?.ToLower() ?? "departureat";
            var sortDir = request.SortDirection?.ToLower() == "desc" ? "desc" : "asc";

            query = sortBy switch
            {
                "departureat" => sortDir == "desc" ? query.OrderByDescending(l => l.DepartureAt) : query.OrderBy(l => l.DepartureAt),
                "createdat" => sortDir == "desc" ? query.OrderByDescending(l => l.CreatedAt) : query.OrderBy(l => l.CreatedAt),
                "title" => sortDir == "desc" ? query.OrderByDescending(l => l.Title) : query.OrderBy(l => l.Title),
                _ => query.OrderBy(l => l.DepartureAt)
            };

            var totalCount = await query.CountAsync(ct);
            var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(l => new ListingSummaryDto(
                    l.Id,
                    l.Title,
                    l.DepartureLocation != null ? l.DepartureLocation.Name : "Unknown",
                    l.DepartureAt,
                    l.DurationDays,
                    l.DestinationText ?? string.Empty,
                    l.AvailabilityStatus,
                    l.VerificationStatus.ToString(),
                    l.PublishedAt
                ))
                .ToListAsync(ct);

            return Result<PagedResult<ListingSummaryDto>>.Success(
                new PagedResult<ListingSummaryDto>(items, request.Page, request.PageSize, totalCount, totalPages));
        }

        public async Task<Result<ListingDetailDto>> GetListingAsync(Guid id, CancellationToken ct = default)
        {
            var listing = await _db.Listings
                .AsNoTracking()
                .Include(l => l.DepartureLocation)
                .Include(l => l.DestinationLocation)
                .Include(l => l.Submitter)
                .FirstOrDefaultAsync(l => l.Id == id, ct);

            if (listing == null)
                return Result<ListingDetailDto>.NotFound("Listing not found");

            // Revalidate visibility
            if (listing.PublicationStatus != PublicationStatus.Approved
                || (listing.ExpiresAt.HasValue && listing.ExpiresAt <= _dt.UtcNow)
                || listing.AvailabilityStatus == "Cancelled")
            {
                return Result<ListingDetailDto>.NotFound("Listing not available");
            }

            var dto = new ListingDetailDto(
                listing.Id,
                listing.Title,
                listing.Description,
                listing.DepartureLocation?.Name ?? "Unknown",
                listing.DepartureLocationId,
                listing.DepartureAt,
                listing.DurationDays,
                listing.DestinationLocation?.Name,
                listing.DestinationLocationId,
                listing.DestinationText,
                listing.AvailabilityStatus,
                listing.PublicationStatus.ToString(),
                listing.VerificationStatus.ToString(),
                listing.PublishedAt,
                listing.ExpiresAt,
                listing.CreatedAt,
                listing.UpdatedAt,
                true, // CanEnquire - always true for public approved listings
                true  // CanReport - always true for public approved listings
            );

            return Result<ListingDetailDto>.Success(dto);
        }

        public async Task<Result<ListingSubmissionResponse>> CreateListingAsync(CreateListingRequest request, CancellationToken ct = default)
        {
            // Create or get submitter user (simplified: create new for now)
            var submitter = new User(request.SubmitterName, $"submitter_{Guid.NewGuid():N}@example.com", request.SubmitterPhone);
            submitter.SetPasswordHash("temp_hash"); // Will be set properly when user registers

            var listing = new Listing(
                submitter.Id,
                request.DepartureLocationId,
                request.Title,
                request.Description,
                request.DepartureAt,
                Enum.Parse<DateStatus>(request.DateStatus),
                request.DurationDays,
                request.DestinationLocationId,
                request.DestinationText,
                request.AvailabilityStatus
            );

            var contact = new ListingContact(
                listing.Id,
                null,
                request.SubmitterPhone,
                request.SubmitterEmail,
                request.WhatsAppNumber,
                request.PreferredContactMethod
            );

            _db.Users.Add(submitter);
            _db.Listings.Add(listing);
            _db.ListingContacts.Add(contact);

            await _db.SaveChangesAsync(ct);

            var reference = $"JC-{listing.Id.ToString()[..8].ToUpper()}";

            return Result<ListingSubmissionResponse>.Success(new ListingSubmissionResponse(
                listing.Id,
                reference,
                listing.PublicationStatus.ToString()
            ));
        }

        public async Task<Result> UpdateListingAsync(Guid id, UpdateListingRequest request, Guid userId, CancellationToken ct = default)
        {
            var listing = await _db.Listings.FindAsync(new object[] { id }, ct);
            if (listing == null)
                return Result.NotFound("Listing not found");

            if (listing.SubmitterUserId != userId)
                return Result.Forbidden("You can only update your own submissions");

            if (listing.PublicationStatus != PublicationStatus.PendingReview
                && listing.PublicationStatus != PublicationStatus.ChangesRequested)
            {
                return Result.ValidationFailed("Cannot update listing in current status");
            }

            listing.UpdateBasicInfo(
                request.Title,
                request.Description,
                request.DepartureAt,
                Enum.Parse<DateStatus>(request.DateStatus),
                request.DurationDays,
                request.DestinationLocationId,
                request.DestinationText,
                request.AvailabilityStatus
            );

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }

        public async Task<Result> WithdrawListingAsync(Guid id, Guid userId, CancellationToken ct = default)
        {
            var listing = await _db.Listings.FindAsync(new object[] { id }, ct);
            if (listing == null)
                return Result.NotFound("Listing not found");

            if (listing.SubmitterUserId != userId)
                return Result.Forbidden("You can only withdraw your own submissions");

            if (listing.PublicationStatus != PublicationStatus.PendingReview
                && listing.PublicationStatus != PublicationStatus.ChangesRequested)
            {
                return Result.ValidationFailed("Cannot withdraw listing in current status");
            }

            listing.SetPublicationStatus(PublicationStatus.Cancelled);
            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }

        public async Task<Result<IReadOnlyList<ListingSummaryDto>>> GetUserSubmissionsAsync(Guid userId, CancellationToken ct = default)
        {
            var listings = await _db.Listings
                .AsNoTracking()
                .Include(l => l.DepartureLocation)
                .Where(l => l.SubmitterUserId == userId)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new ListingSummaryDto(
                    l.Id,
                    l.Title,
                    l.DepartureLocation != null ? l.DepartureLocation.Name : "Unknown",
                    l.DepartureAt,
                    l.DurationDays,
                    l.DestinationText ?? string.Empty,
                    l.AvailabilityStatus,
                    l.VerificationStatus.ToString(),
                    l.PublishedAt
                ))
                .ToListAsync(ct);

            return Result<IReadOnlyList<ListingSummaryDto>>.Success(listings);
        }
    }
}