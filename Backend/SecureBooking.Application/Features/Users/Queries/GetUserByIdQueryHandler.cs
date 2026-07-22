using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Users;

public sealed class GetUserByIdQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetUserByIdQuery, UserResponse>
{
    public async Task<UserResponse> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await db.Users
            .AsNoTracking()
            .Where(u => u.Id == request.Id)
            .Select(u => new UserResponse(
                u.Id, u.FirstName, u.LastName, u.Email, u.IsActive, u.CreatedAt,
                u.Roles.Select(r => new RoleSummary(r.Id, r.Name)).ToList()))
            .FirstOrDefaultAsync(cancellationToken);

        return user ?? throw new NotFoundException(nameof(User), request.Id);
    }
}
