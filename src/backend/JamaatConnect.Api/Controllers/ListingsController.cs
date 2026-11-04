using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JamaatConnect.Application.DTOs;
using JamaatConnect.Application.Interfaces;
using JamaatConnect.Application.Common;

namespace JamaatConnect.Api.Controllers
{
    [ApiController]
    [Route("api/v1/listings")]
    public class ListingsController : ControllerBase
    {
        private readonly IListingService _listingService;

        public ListingsController(IListingService listingService)
        {
            _listingService = listingService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<ListingSummaryDto>>> Search(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? locationId = null,
            [FromQuery] DateTime? departureDateFrom = null,
            [FromQuery] DateTime? departureDateTo = null,
            [FromQuery] int? durationDays = null,
            [FromQuery] string? availabilityStatus = null,
            [FromQuery] string? sortBy = "departureAt",
            [FromQuery] string? sortDirection = "asc")
        {
            var request = new ListingSearchRequest(page, pageSize, locationId, departureDateFrom, departureDateTo,
                durationDays, availabilityStatus, sortBy, sortDirection);
            var result = await _listingService.SearchListingsAsync(request);
            return result.IsSuccess ? Ok(result.Value) : HandleError(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ListingDetailDto>> Get(Guid id)
        {
            var result = await _listingService.GetListingAsync(id);
            return result.IsSuccess ? Ok(result.Value) : HandleError(result);
        }

        [HttpPost]
        public async Task<ActionResult<ListingSubmissionResponse>> Create([FromBody] CreateListingRequest request)
        {
            var result = await _listingService.CreateListingAsync(request);
            return result.IsSuccess ? CreatedAtAction(nameof(Get), new { id = result.Value.SubmissionId }, result.Value) : HandleError(result);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateListingRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _listingService.UpdateListingAsync(id, request, userId);
            return result.IsSuccess ? NoContent() : HandleError(result);
        }

        [HttpPost("{id}/withdraw")]
        [Authorize]
        public async Task<IActionResult> Withdraw(Guid id)
        {
            var userId = GetCurrentUserId();
            var result = await _listingService.WithdrawListingAsync(id, userId);
            return result.IsSuccess ? NoContent() : HandleError(result);
        }

        [HttpGet("my/submissions")]
        [Authorize]
        public async Task<ActionResult<IReadOnlyList<ListingSummaryDto>>> GetMySubmissions()
        {
            var userId = GetCurrentUserId();
            var result = await _listingService.GetUserSubmissionsAsync(userId);
            return result.IsSuccess ? Ok(result.Value) : HandleError(result);
        }

        private Guid GetCurrentUserId()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return Guid.Parse(claim?.Value ?? throw new UnauthorizedAccessException());
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
    }
}