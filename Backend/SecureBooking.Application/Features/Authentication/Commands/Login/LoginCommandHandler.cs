using System.Linq;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Authentication.Commands.Login;

public sealed class LoginCommandHnadler(
    IApplicationDbContext db,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator tokenGenerator,
    IUnitOfWork unitOfWork,
    IRefreshTokenService refreshTokenService
    ) : IRequestHandler<LoginCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.ToLowerInvariant();

        var user = await db.Users
            .Include(u => u.Roles)
            .ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

         if (!passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");


        var accessToken = tokenGenerator.Generate(user);
        var refreshToken = await refreshTokenService.CreateAsync(user,cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var roleNames = user.Roles.Select(r => r.Name).ToList();
        var permissionCodes = user.Roles.SelectMany(r => r.Permissions).Select(p => p.Code).Distinct().ToList();

        return new AuthResponse(
            accessToken.AccessToken,
            accessToken.AccessTokenExpiresAt,
            refreshToken.Token,
            refreshToken.ExpiresAt,
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            roleNames,
            permissionCodes
        );
    }
}
