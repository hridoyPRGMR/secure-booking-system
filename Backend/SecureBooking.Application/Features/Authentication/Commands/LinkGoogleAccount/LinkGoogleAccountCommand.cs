using MediatR;

namespace SecureBooking.Application.Features.Authentication.Commands.LinkGoogleAccount;

/// <param name="Ticket">Link ticket issued by the Google callback.</param>
/// <param name="Password">The existing account's password: proof the caller owns that account.</param>
public sealed record LinkGoogleAccountCommand(string Ticket, string Password) : IRequest<AuthResponse>;
