using MediatR;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Authentication.Commands.Login;

public sealed class LoginCommandHnadler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator tokenGenerator,
    IUnitOfWork unitOfWork,
    IRefreshTokenService refreshTokenService
    ) : IRequestHandler<LoginCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken) 
            ?? throw new UnauthorizedAccessException("Invalid email or password.");
        
         if (!passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");


        var accessToken = tokenGenerator.Generate(user);
        var refreshToken = await refreshTokenService.CreateAsync(user,cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResponse(
            accessToken.AccessToken,
            accessToken.AccessTokenExpiresAt,
            refreshToken.Token,
            refreshToken.ExpiresAt,
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email
        );
    }
}