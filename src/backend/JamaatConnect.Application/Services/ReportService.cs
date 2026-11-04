using JamaatConnect.Application.Common;
using JamaatConnect.Application.Interfaces;
using JamaatConnect.Application.DTOs;
using JamaatConnect.Domain.Entities;
using JamaatConnect.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace JamaatConnect.Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IJamaatContext _db;
        private readonly IDateTimeProvider _dt;
        private readonly ICurrentUserService _currentUser;

        public ReportService(IJamaatContext db, IDateTimeProvider dt, ICurrentUserService currentUser)
        {
            _db = db;
            _dt = dt;
            _currentUser = currentUser;
        }

        public async Task<Result<ListingReportDto>> CreateReportAsync(
            CreateListingReportRequest request, Guid? reporterUserId, CancellationToken ct = default)
        {
            var listing = await _db.Listings
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == request.ListingId, ct);

            if (listing == null)
                return Result<ListingReportDto>.NotFound("Listing not found");

            var report = new ListingReport(request.ListingId, reporterUserId, request.Reason, request.Description);
            _db.ListingReports.Add(report);

            await _db.SaveChangesAsync(ct);

            return Result<ListingReportDto>.Success(new ListingReportDto(
                report.Id,
                report.ListingId,
                listing.Title,
                report.Reason,
                report.Description,
                report.Status,
                report.CreatedAt
            ));
        }

        public async Task<Result<PagedResult<ListingReportDto>>> GetReportsAsync(
            int page = 1, int pageSize = 20, string? status = null, CancellationToken ct = default)
        {
            var query = _db.ListingReports
                .AsNoTracking()
                .Include(r => r.Listing)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(r => r.Status == status);

            query = query.OrderByDescending(r => r.CreatedAt);

            var totalCount = await query.CountAsync(ct);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new ListingReportDto(
                    r.Id,
                    r.ListingId,
                    r.Listing != null ? r.Listing.Title : "Unknown",
                    r.Reason,
                    r.Description,
                    r.Status,
                    r.CreatedAt
                ))
                .ToListAsync(ct);

            return Result<PagedResult<ListingReportDto>>.Success(
                new PagedResult<ListingReportDto>(items, page, pageSize, totalCount, totalPages));
        }

        public async Task<Result> ResolveReportAsync(
            Guid reportId, Guid moderatorUserId, string reason, CancellationToken ct = default)
        {
            var report = await _db.ListingReports
                .Include(r => r.Listing)
                .FirstOrDefaultAsync(r => r.Id == reportId, ct);

            if (report == null)
                return Result.NotFound("Report not found");

            report.SetStatus("Reviewed");

            var action = new ModerationAction(
                report.ListingId,
                moderatorUserId,
                "ReportReviewed",
                reason);
            _db.ModerationActions.Add(action);

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}
