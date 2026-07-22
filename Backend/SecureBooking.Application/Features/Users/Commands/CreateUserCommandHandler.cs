using System.Security.Cryptography;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Users;

public sealed class CreateUserCommandHandler(
    IRepository<User> repository,
    IApplicationDbContext db,
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork
) : IRequestHandler<CreateUserCommand, CreateUserResult>
{
    private const string LowerChars = "abcdefghjkmnpqrstuvwxyz";
    private const string UpperChars = "ABCDEFGHJKMNPQRSTUVWXYZ";
    private const string DigitChars = "23456789";

    public async Task<CreateUserResult> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var temporaryPassword = GenerateTemporaryPassword();
        var user = new User(request.FirstName, request.LastName, request.Email, passwordHasher.Hash(temporaryPassword));

        if (request.RoleIds.Count > 0)
        {
            var roles = await db.Roles
                .Where(r => request.RoleIds.Contains(r.Id))
                .ToListAsync(cancellationToken);
            user.SetRoles(roles);
        }

        await repository.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var roleSummaries = user.Roles.Select(r => new RoleSummary(r.Id, r.Name)).ToList();
        var response = new UserResponse(user.Id, user.FirstName, user.LastName, user.Email, user.IsActive, user.CreatedAt, roleSummaries);
        return new CreateUserResult(response, temporaryPassword);
    }

    /// <summary>Random password guaranteed to satisfy RegisterCommandValidator's policy (upper+lower+digit, 8+ chars).</summary>
    private static string GenerateTemporaryPassword()
    {
        Span<char> buffer = stackalloc char[12];
        buffer[0] = UpperChars[RandomNumberGenerator.GetInt32(UpperChars.Length)];
        buffer[1] = LowerChars[RandomNumberGenerator.GetInt32(LowerChars.Length)];
        buffer[2] = DigitChars[RandomNumberGenerator.GetInt32(DigitChars.Length)];

        const string all = LowerChars + UpperChars + DigitChars;
        for (var i = 3; i < buffer.Length; i++)
            buffer[i] = all[RandomNumberGenerator.GetInt32(all.Length)];

        // Shuffle so the guaranteed characters aren't always in the first three positions.
        for (var i = buffer.Length - 1; i > 0; i--)
        {
            var j = RandomNumberGenerator.GetInt32(i + 1);
            (buffer[i], buffer[j]) = (buffer[j], buffer[i]);
        }

        return new string(buffer);
    }
}
