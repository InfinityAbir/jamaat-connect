using JamaatConnect.Application.Common;
using JamaatConnect.Application.Interfaces;
using JamaatConnect.Application.DTOs;
using JamaatConnect.Domain.Entities;
using JamaatConnect.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace JamaatConnect.Application.Services
{
    public class ModerationService : IModerationService
    {
        private readonly IJamaatContext _db;
        private readonly IDateTimeProvider _dt;
        private readonly ICurrentUserService _currentUser;
        private readonly ISmtpEmailService _email;

        public ModerationService(
            IJamaatContext db,
            IDateTimeProvider dt,
            ICurrentUserService currentUser,
            ISmtpEmailService email)
        {
            _db = db;
            _dt = dt;
            _currentUser = currentUser;
            _email = email;
        }

        public async Task<Result<PagedResult<ModerationQueueItemDto>>> GetModerationQueueAsync(
            int page = 1, int pageSize = 20, CancellationToken ct = default)
        {
            var query = _db.Listings
                .AsNoTracking()
                .Include(l => l.ContactInfo)
                .Include(l => l.Submitter)
                .Include(l => l.DepartureLocation)
                .Where(l => l.PublicationStatus == PublicationStatus.PendingReview
                    || l.PublicationStatus == PublicationStatus.ChangesRequested)
                .OrderByDescending(l => l.CreatedAt);

            var totalCount = await query.CountAsync(ct);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new ModerationQueueItemDto(
                    l.Id,
                    l.Title,
                    l.DepartureLocation != null ? l.DepartureLocation.Name : "Unknown",
                    l.DepartureAt,
                    l.DurationDays,
                    l.PublicationStatus.ToString(),
                    l.VerificationStatus.ToString(),
                    l.Submitter != null ? l.Submitter.DisplayName : "Unknown",
                    l.Submitter != null ? (l.Submitter.PhonePrivate ?? string.Empty) : string.Empty,
                    l.ContactInfo != null ? l.ContactInfo.PrivateEmail : null,
                    l.ContactInfo != null ? l.ContactInfo.WhatsAppNumber : null,
                    l.ContactInfo != null ? l.ContactInfo.PreferredContactMethod : string.Empty,
                    l.SubmitterUserId,
                    l.CreatedAt
                ))
                .ToListAsync(ct);

            return Result<PagedResult<ModerationQueueItemDto>>.Success(
                new PagedResult<ModerationQueueItemDto>(items, page, pageSize, totalCount, totalPages));
        }

        public async Task<Result> ApproveListingAsync(
            Guid listingId, Guid moderatorUserId, string reason, CancellationToken ct = default)
        {
            var listing = await _db.Listings
                .Include(l => l.Submitter)
                .Include(l => l.ContactInfo)
                .FirstOrDefaultAsync(l => l.Id == listingId, ct);

            if (listing == null)
                return Result.NotFound("Listing not found");

            if (listing.PublicationStatus != PublicationStatus.PendingReview
                && listing.PublicationStatus != PublicationStatus.ChangesRequested)
            {
                return Result.ValidationFailed("Only pending or changes-requested listings can be approved");
            }

            // Self-approval prevention rule
            if (listing.SubmitterUserId == moderatorUserId)
            {
                return Result.Forbidden("Moderators cannot approve their own submissions");
            }

            var now = _dt.UtcNow;
            listing.SetPublicationStatus(PublicationStatus.Approved, now);

            var action = new ModerationAction(listingId, moderatorUserId, "Approved", reason);
            _db.ModerationActions.Add(action);

            await _db.SaveChangesAsync(ct);

            // Notify submitter
            if (listing.Submitter != null && !string.IsNullOrEmpty(listing.Submitter.Email))
            {
                await _email.SendListingStatusUpdateAsync(
                    listing.Submitter.Email,
                    listing.Submitter.DisplayName,
                    listing.Title,
                    "Approved",
                    reason);
            }

            return Result.Success();
        }

        public async Task<Result> RequestChangesAsync(
            Guid listingId, Guid moderatorUserId, string reason, CancellationToken ct = default)
        {
            var listing = await _db.Listings
                .Include(l => l.Submitter)
                .FirstOrDefaultAsync(l => l.Id == listingId, ct);

            if (listing == null)
                return Result.NotFound("Listing not found");

            if (listing.PublicationStatus != PublicationStatus.PendingReview
                && listing.PublicationStatus != PublicationStatus.ChangesRequested)
            {
                return Result.ValidationFailed("Only pending or changes-requested listings can have changes requested");
            }

            // Self-approval prevention rule
            if (listing.SubmitterUserId == moderatorUserId)
            {
                return Result.Forbidden("Moderators cannot request changes on their own submissions");
            }

            listing.SetPublicationStatus(PublicationStatus.ChangesRequested);

            var action = new ModerationAction(listingId, moderatorUserId, "RequestChanges", reason);
            _db.ModerationActions.Add(action);

            await _db.SaveChangesAsync(ct);

            if (listing.Submitter != null && !string.IsNullOrEmpty(listing.Submitter.Email))
            {
                await _email.SendListingStatusUpdateAsync(
                    listing.Submitter.Email,
                    listing.Submitter.DisplayName,
                    listing.Title,
                    "Changes Requested",
                    reason);
            }

            return Result.Success();
        }

        public async Task<Result> RejectListingAsync(
            Guid listingId, Guid moderatorUserId, string reason, CancellationToken ct = default)
        {
            var listing = await _db.Listings
                .Include(l => l.Submitter)
                .FirstOrDefaultAsync(l => l.Id == listingId, ct);

            if (listing == null)
                return Result.NotFound("Listing not found");

            if (listing.PublicationStatus != PublicationStatus.PendingReview
                && listing.PublicationStatus != PublicationStatus.ChangesRequested)
            {
                return Result.ValidationFailed("Only pending or changes-requested listings can be rejected");
            }

            // Self-approval prevention rule
            if (listing.SubmitterUserId == moderatorUserId)
            {
                return Result.Forbidden("Moderators cannot reject their own submissions");
            }

            listing.SetPublicationStatus(PublicationStatus.Rejected);

            var action = new ModerationAction(listingId, moderatorUserId, "Rejected", reason);
            _db.ModerationActions.Add(action);

            await _db.SaveChangesAsync(ct);

            if (listing.Submitter != null && !string.IsNullOrEmpty(listing.Submitter.Email))
            {
                await _email.SendListingStatusUpdateAsync(
                    listing.Submitter.Email,
                    listing.Submitter.DisplayName,
                    listing.Title,
                    "Rejected",
                    reason);
            }

            return Result.Success();
        }

        public async Task<Result> SuspendListingAsync(
            Guid listingId, Guid moderatorUserId, string reason, CancellationToken ct = default)
        {
            var listing = await _db.Listings
                .Include(l => l.Submitter)
                .FirstOrDefaultAsync(l => l.Id == listingId, ct);

            if (listing == null)
                return Result.NotFound("Listing not found");

            if (listing.PublicationStatus != PublicationStatus.Approved)
            {
                return Result.ValidationFailed("Only approved listings can be suspended");
            }

            listing.SetPublicationStatus(PublicationStatus.Suspended);

            var action = new ModerationAction(listingId, moderatorUserId, "Suspended", reason);
            _db.ModerationActions.Add(action);

            await _db.SaveChangesAsync(ct);

            if (listing.Submitter != null && !string.IsNullOrEmpty(listing.Submitter.Email))
            {
                await _email.SendListingStatusUpdateAsync(
                    listing.Submitter.Email,
                    listing.Submitter.DisplayName,
                    listing.Title,
                    "Suspended",
                    reason);
            }

            return Result.Success();
        }
    }
}