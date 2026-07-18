using MediatR;

namespace SecureBooking.Application.Features.Authentication.Commands.Register
{
    public sealed record RegisterCommand(
        string FirstName,
        string LastName,
        string Email,
        string Password
    ): IRequest<AuthResponse>;      
}