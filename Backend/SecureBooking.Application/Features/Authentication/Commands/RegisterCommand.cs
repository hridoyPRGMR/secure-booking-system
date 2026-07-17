using MediatR;

namespace SecureBooking.Application.Features.Authentication.Commands
{
    public sealed record RegisterCommand(
        string FirstName,
        string LastName,
        string Email,
        string Password
    ): IRequest<AuthResponse>;      
}