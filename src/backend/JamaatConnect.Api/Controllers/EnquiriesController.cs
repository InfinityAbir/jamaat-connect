using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JamaatConnect.Application.DTOs;
using JamaatConnect.Application.Interfaces;
using JamaatConnect.Application.Common;

namespace JamaatConnect.Api.Controllers
{
    [ApiController]
    [Route("api/v1/enquiries")]
    public class EnquiriesController : ControllerBase
    {
        private readonly IEnquiryService _enquiryService;

        public EnquiriesController(IEnquiryService enquiryService)
        {
            _enquiryService = enquiryService;
        }

        [HttpPost]
        public async Task<ActionResult<EnquiryResponse>> Create([FromBody] CreateEnquiryRequest request)
        {
            var result = await _enquiryService.CreateEnquiryAsync(request);
            return result.IsSuccess ? CreatedAtAction(nameof(Get), new { id = result.Value.EnquiryId }, result.Value) : HandleError(result);
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<PagedResult<EnquiryDetailDto>>> Search(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] Guid? listingId = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? createdFrom = null,
            [FromQuery] DateTime? createdTo = null)
        {
            var request = new EnquirySearchRequest(page, pageSize, listingId, status, createdFrom, createdTo);
            var result = await _enquiryService.SearchEnquiriesAsync(request);
            return result.IsSuccess ? Ok(result.Value) : HandleError(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<EnquiryDetailDto>> Get(Guid id)
        {
            var result = await _enquiryService.GetEnquiryAsync(id);
            return result.IsSuccess ? Ok(result.Value) : HandleError(result);
        }

        [HttpPost("{id}/moderate")]
        [Authorize(Roles = "Administrator,Moderator")]
        public async Task<IActionResult> Moderate(Guid id, [FromBody] EnquiryModerationAction action)
        {
            if (action.EnquiryId != id)
                return BadRequest(new { error = "Enquiry ID mismatch" });

            var result = await _enquiryService.ModerateEnquiryAsync(action);
            return result.IsSuccess ? NoContent() : HandleError(result);
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