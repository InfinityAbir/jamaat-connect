using JamaatConnect.Application.Common;
using JamaatConnect.Application.DTOs;
using JamaatConnect.Application.Interfaces;
using JamaatConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JamaatConnect.Application.Services
{
    public class LocationService : ILocationService
    {
        private readonly IJamaatContext _db;

        public LocationService(IJamaatContext db)
        {
            _db = db;
        }

        public async Task<Result<IReadOnlyList<LocationDto>>> GetLocationsAsync(Guid? parentId = null, CancellationToken ct = default)
        {
            var query = _db.Locations.AsNoTracking().Where(l => l.IsActive);

            if (parentId.HasValue)
                query = query.Where(l => l.ParentLocationId == parentId.Value);
            else
                query = query.Where(l => l.ParentLocationId == null); // Top level

            var locations = await query
                .OrderBy(l => l.Name)
                .Select(l => new LocationDto(l.Id, l.Name, l.StableIdentifier, l.Level, l.ParentLocationId, l.IsActive))
                .ToListAsync(ct);

            return Result<IReadOnlyList<LocationDto>>.Success(locations);
        }

        public async Task<Result<LocationDto>> GetLocationAsync(Guid id, CancellationToken ct = default)
        {
            var location = await _db.Locations
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == id, ct);

            if (location == null)
                return Result<LocationDto>.NotFound("Location not found");

            return Result<LocationDto>.Success(new LocationDto(
                location.Id, location.Name, location.StableIdentifier, location.Level,
                location.ParentLocationId, location.IsActive));
        }

        public async Task<Result<LocationDto>> CreateLocationAsync(CreateLocationRequest request, CancellationToken ct = default)
        {
            var location = new Location(request.Name, request.StableIdentifier, request.Level, request.ParentId);
            _db.Locations.Add(location);
            await _db.SaveChangesAsync(ct);

            return Result<LocationDto>.Success(new LocationDto(
                location.Id, location.Name, location.StableIdentifier, location.Level,
                location.ParentLocationId, location.IsActive));
        }

        public async Task<Result<LocationDto>> UpdateLocationAsync(Guid id, UpdateLocationRequest request, CancellationToken ct = default)
        {
            var location = await _db.Locations.FindAsync(new object[] { id }, ct);
            if (location == null)
                return Result<LocationDto>.NotFound("Location not found");

            location.UpdateDetails(request.Name, request.StableIdentifier, request.IsActive);
            await _db.SaveChangesAsync(ct);

            return Result<LocationDto>.Success(new LocationDto(
                location.Id, location.Name, location.StableIdentifier, location.Level,
                location.ParentLocationId, location.IsActive));
        }

        public async Task<Result> DeleteLocationAsync(Guid id, CancellationToken ct = default)
        {
            var location = await _db.Locations.FindAsync(new object[] { id }, ct);
            if (location == null)
                return Result.NotFound("Location not found");

            var hasChildren = await _db.Locations.AnyAsync(l => l.ParentLocationId == id, ct);
            if (hasChildren)
                return Result.ValidationFailed("Cannot delete location with child locations");

            location.Deactivate();
            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
    }
}