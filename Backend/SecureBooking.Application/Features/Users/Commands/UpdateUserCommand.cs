using MediatR;

namespace SecureBooking.Application.Features.Users;

public sealed record UpdateUserCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string Email
) : IRequest<UserResponse>;
