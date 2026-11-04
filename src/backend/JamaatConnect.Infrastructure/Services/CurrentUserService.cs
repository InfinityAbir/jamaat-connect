using JamaatConnect.Application.Common;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace JamaatConnect.Infrastructure.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? UserId
        {
            get
            {
                var value = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return Guid.TryParse(value, out var guid) ? guid : null;
            }
        }

        public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;
        public string? DisplayName => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value;
        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

        public bool IsInRole(string role) => _httpContextAccessor.HttpContext?.User?.IsInRole(role) ?? false;

        public IReadOnlyCollection<string> Roles
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role);
                if (claims == null) return Array.Empty<string>();
                return claims.Select(c => c.Value).ToList();
            }
        }
    }
}