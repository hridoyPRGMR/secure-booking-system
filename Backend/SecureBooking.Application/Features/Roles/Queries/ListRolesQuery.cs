using MediatR;
using SecureBooking.Application.Common.Models;

namespace SecureBooking.Application.Features.Roles;

public sealed record ListRolesQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? SortBy = null,
    bool SortDescending = false
) : IRequest<PagedResult<RoleResponse>>;
