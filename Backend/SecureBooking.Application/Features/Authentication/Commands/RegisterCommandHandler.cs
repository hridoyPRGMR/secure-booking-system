using MediatR;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Authentication.Commands.Register;

public sealed class RegisterCommandHandler(
    IUserRepository users,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator,
    IUnitOfWork unitOfWork)
        : IRequestHandler<RegisterCommand, AuthResponse>
{

    public async Task<AuthResponse> Handle(
        RegisterCommand request,
        CancellationToken cancellationToken)
    {
        var exists = await users.ExistsByEmailAsync(
            request.Email,
            cancellationToken);

        if (exists)
            throw new InvalidOperationException("Email already exists.");

        var passwordHash =
            passwordHasher.Hash(request.Password);

        var user = new User(
            request.FirstName,
            request.LastName,
            request.Email,
            passwordHash);

        await users.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var token = jwtTokenGenerator.Generate(user);

        return new AuthResponse(
            token,
            DateTime.UtcNow.AddMinutes(15),
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email);
    }
}