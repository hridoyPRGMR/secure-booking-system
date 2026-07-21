using MediatR;

namespace SecureBooking.Application.Features.Users;

public sealed record CreateUserCommand(
    string FirstName,
    string LastName,
    string Email
) : IRequest<CreateUserResult>;
