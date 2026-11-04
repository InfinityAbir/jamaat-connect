using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JamaatConnect.Application.Common;
using JamaatConnect.Application.Interfaces;
using JamaatConnect.Application.DTOs;

namespace JamaatConnect.Api.Controllers
{
    [ApiController]
    [Route("api/v1/admin")]
    [Authorize(Policy = "RequireModerator")]
    public class ModerationController : ControllerBase
    {
        private readonly IModerationService _moderationService;

        public ModerationController(IModerationService moderationService)
        {
            _moderationService = moderationService;
        }

        [HttpGet("moderation/queue")]
        public async Task<IActionResult> GetQueue([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _moderationService.GetModerationQueueAsync(page, pageSize);
            return result.IsSuccess ? Ok(result.Value) : HandleError(result);
        }

        [HttpPost("listings/{id}/approve")]
        public async Task<IActionResult> Approve(Guid id, [FromBody] ListingModerationActionRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _moderationService.ApproveListingAsync(id, userId, request.Reason ?? string.Empty);
            return result.IsSuccess ? NoContent() : HandleError(result);
        }

        [HttpPost("listings/{id}/request-changes")]
        public async Task<IActionResult> RequestChanges(Guid id, [FromBody] ListingModerationActionRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _moderationService.RequestChangesAsync(id, userId, request.Reason ?? string.Empty);
            return result.IsSuccess ? NoContent() : HandleError(result);
        }

        [HttpPost("listings/{id}/reject")]
        public async Task<IActionResult> Reject(Guid id, [FromBody] ListingModerationActionRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _moderationService.RejectListingAsync(id, userId, request.Reason ?? string.Empty);
            return result.IsSuccess ? NoContent() : HandleError(result);
        }

        [HttpPost("listings/{id}/suspend")]
        public async Task<IActionResult> Suspend(Guid id, [FromBody] ListingModerationActionRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _moderationService.SuspendListingAsync(id, userId, request.Reason ?? string.Empty);
            return result.IsSuccess ? NoContent() : HandleError(result);
        }

        private Guid GetCurrentUserId()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return Guid.Parse(claim?.Value ?? throw new UnauthorizedAccessException());
        }

        private ActionResult HandleError(Result result)
        {
            return result.ErrorCode switch
            {
                "NOT_FOUND" => NotFound(new { error = result.Error }),
                "UNAUTHORIZED" => Unauthorized(new { error = result.Error }),
                "FORBIDDEN" => Forbid(),
                "VALIDATION_ERROR" => BadRequest(new { error = result.Error }),
                "CONFLICT" => Conflict(new { error = result.Error }),
                _ => StatusCode(500, new { error = result.Error })
            };
        }

        private ActionResult HandleError<T>(Result<T> result)
        {
            return result.ErrorCode switch
            {
                "NOT_FOUND" => NotFound(new { error = result.Error }),
                "UNAUTHORIZED" => Unauthorized(new { error = result.Error }),
                "FORBIDDEN" => Forbid(),
                "VALIDATION_ERROR" => BadRequest(new { error = result.Error }),
                "CONFLICT" => Conflict(new { error = result.Error }),
                _ => StatusCode(500, new { error = result.Error })
            };
        }
    }
}