using JamaatConnect.Application.Common;
using JamaatConnect.Application.Interfaces;
using JamaatConnect.Application.DTOs;
using JamaatConnect.Domain.Entities;
using JamaatConnect.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace JamaatConnect.Application.Services
{
    public class OrganizerVerificationService : IOrganizerVerificationService
    {
        private readonly IJamaatContext _db;
        private readonly IDateTimeProvider _dt;
        private readonly ICurrentUserService _currentUser;

        public OrganizerVerificationService(
            IJamaatContext db,
            IDateTimeProvider dt,
            ICurrentUserService currentUser)
        {
            _db = db;
            _dt = dt;
            _currentUser = currentUser;
        }

        public async Task<Result<IReadOnlyList<OrganizerVerificationDto>>> GetVerificationsAsync(
            string? status = null, CancellationToken ct = default)
        {
            var query = _db.OrganizerVerifications
                .AsNoTracking()
                .Include(ov => ov.Organizer)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(ov => ov.Status == status);

            var items = await query
                .OrderByDescending(ov => ov.CreatedAt)
                .Select(ov => new OrganizerVerificationDto(
                    ov.Id,
                    ov.OrganizerUserId,
                    ov.Organizer != null ? ov.Organizer.DisplayName : "Unknown",
                    ov.VerificationMethod,
                    ov.Status,
                    ov.ExpiresAt,
                    ov.InternalNotes,
                    ov.CreatedAt
                ))
                .ToListAsync(ct);

            return Result<IReadOnlyList<OrganizerVerificationDto>>.Success(items);
        }

        public async Task<Result<OrganizerVerificationDto>> VerifyOrganizerAsync(
            VerifyOrganizerRequest request, Guid reviewerUserId, CancellationToken ct = default)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Id == request.OrganizerUserId, ct);

            if (user == null)
                return Result<OrganizerVerificationDto>.NotFound("User not found");

            var verification = await _db.OrganizerVerifications
                .FirstOrDefaultAsync(ov => ov.OrganizerUserId == request.OrganizerUserId
                    && ov.Status == "Pending", ct);

            if (verification == null)
            {
                verification = new OrganizerVerification(
                    request.OrganizerUserId,
                    request.VerificationMethod,
                    request.Status,
                    request.ExpiresAt);
                _db.OrganizerVerifications.Add(verification);
            }

            verification.SetStatus(request.Status, reviewerUserId, request.InternalNotes);

            if (request.Status == "Approved")
            {
                verification.UpdateExpiry(request.ExpiresAt);
            }

            await _db.SaveChangesAsync(ct);

            return Result<OrganizerVerificationDto>.Success(new OrganizerVerificationDto(
                verification.Id,
                verification.OrganizerUserId,
                user.DisplayName,
                verification.VerificationMethod,
                verification.Status,
                verification.ExpiresAt,
                verification.InternalNotes,
                verification.CreatedAt
            ));
        }
    }
}