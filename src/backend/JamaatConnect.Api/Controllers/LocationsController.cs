using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JamaatConnect.Application.DTOs;
using JamaatConnect.Application.Interfaces;
using JamaatConnect.Application.Common;

namespace JamaatConnect.Api.Controllers
{
    [ApiController]
    [Route("api/v1/locations")]
    public class LocationsController : ControllerBase
    {
        private readonly ILocationService _locationService;

        public LocationsController(ILocationService locationService)
        {
            _locationService = locationService;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<LocationDto>>> GetAll([FromQuery] Guid? parentId = null)
        {
            var result = await _locationService.GetLocationsAsync(parentId);
            return result.IsSuccess ? Ok(result.Value) : HandleError(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LocationDto>> Get(Guid id)
        {
            var result = await _locationService.GetLocationAsync(id);
            return result.IsSuccess ? Ok(result.Value) : HandleError(result);
        }

        [HttpPost]
        [Authorize(Policy = "RequireAdmin")]
        public async Task<ActionResult<LocationDto>> Create([FromBody] CreateLocationRequest request)
        {
            var result = await _locationService.CreateLocationAsync(request);
            return result.IsSuccess ? CreatedAtAction(nameof(Get), new { id = result.Value.Id }, result.Value) : HandleError(result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "RequireAdmin")]
        public async Task<ActionResult<LocationDto>> Update(Guid id, [FromBody] UpdateLocationRequest request)
        {
            var result = await _locationService.UpdateLocationAsync(id, request);
            return result.IsSuccess ? Ok(result.Value) : HandleError(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "RequireAdmin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _locationService.DeleteLocationAsync(id);
            return result.IsSuccess ? NoContent() : HandleError(result);
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