using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JamaatConnect.Application.Common;
using JamaatConnect.Application.Interfaces;
using JamaatConnect.Application.DTOs;

namespace JamaatConnect.Api.Controllers
{
    [ApiController]
    [Route("api/v1")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpPost("listings/{id}/reports")]
        [Authorize]
        public async Task<IActionResult> CreateReport(Guid id, [FromBody] CreateListingReportRequest request)
        {
            if (request.ListingId != id)
                return BadRequest(new { error = "Listing ID mismatch" });

            var userId = GetCurrentUserId();
            var result = await _reportService.CreateReportAsync(request, userId);
            return result.IsSuccess ? CreatedAtAction(nameof(Get), new { id = result.Value.Id }, result.Value) : HandleError(result);
        }

        [HttpGet("admin/reports")]
        [Authorize(Policy = "RequireModerator")]
        public async Task<IActionResult> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null)
        {
            var result = await _reportService.GetReportsAsync(page, pageSize, status);
            return result.IsSuccess ? Ok(result.Value) : HandleError(result);
        }

        [HttpPost("admin/reports/{id}/resolve")]
        [Authorize(Policy = "RequireModerator")]
        public async Task<IActionResult> ResolveReport(Guid id, [FromBody] ResolveReportRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _reportService.ResolveReportAsync(id, userId, request.Reason);
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

    public record ResolveReportRequest([Required] string Reason);
}