using MediatR;
using SecureBooking.Application.Common.Models;

namespace SecureBooking.Application.Features.Users;

public sealed record ListUsersQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? SortBy = null,
    bool SortDescending = false,
    bool? IsActive = null
) : IRequest<PagedResult<UserResponse>>;
