using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Models;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Roles;

public sealed class ListRolesQueryHandler(IApplicationDbContext db)
    : IRequestHandler<ListRolesQuery, PagedResult<RoleResponse>>
{
    public async Task<PagedResult<RoleResponse>> Handle(ListRolesQuery request, CancellationToken cancellationToken)
    {
        var query = db.Roles.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLower();
            query = query.Where(r =>
                r.Name.ToLower().Contains(term) ||
                r.Description.ToLower().Contains(term));
        }

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "createdat" => request.SortDescending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt),
            _ => request.SortDescending ? query.OrderByDescending(r => r.Name) : query.OrderBy(r => r.Name),
        };

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new RoleResponse(
                r.Id,
                r.Name,
                r.Description,
                r.Permissions.Select(p => p.Code).ToList(),
                db.Users.Count(u => u.Roles.Any(ur => ur.Id == r.Id)),
                r.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<RoleResponse>(items, request.Page, request.PageSize, total);
    }
}
