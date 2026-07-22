using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureBooking.Application.Common.Security;

namespace SecureBooking.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/permissions")]
public class PermissionsController : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = Policies.RolesView)]
    public IActionResult List()
    {
        var result = PermissionCatalog.All
            .Select(p => new { code = p.Code, area = p.Area, action = p.Action, description = p.Description })
            .ToList();

        return Ok(result);
    }
}
