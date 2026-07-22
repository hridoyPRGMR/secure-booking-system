using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Models;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Users;

public sealed class ListUsersQueryHandler(IApplicationDbContext db)
    : IRequestHandler<ListUsersQuery, PagedResult<UserResponse>>
{
    public async Task<PagedResult<UserResponse>> Handle(ListUsersQuery request, CancellationToken cancellationToken)
    {
        var query = db.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLower();
            query = query.Where(u =>
                u.FirstName.ToLower().Contains(term) ||
                u.LastName.ToLower().Contains(term) ||
                u.Email.ToLower().Contains(term));
        }

        if (request.IsActive.HasValue)
            query = query.Where(u => u.IsActive == request.IsActive);

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "email" => request.SortDescending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "createdat" => request.SortDescending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
            _ => request.SortDescending ? query.OrderByDescending(u => u.FirstName) : query.OrderBy(u => u.FirstName),
        };

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new UserResponse(
                u.Id, u.FirstName, u.LastName, u.Email, u.IsActive, u.CreatedAt,
                u.Roles.Select(r => new RoleSummary(r.Id, r.Name)).ToList()))
            .ToListAsync(cancellationToken);

        return new PagedResult<UserResponse>(items, request.Page, request.PageSize, total);
    }
}
