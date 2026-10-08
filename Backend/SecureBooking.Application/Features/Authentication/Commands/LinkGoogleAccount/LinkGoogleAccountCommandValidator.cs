using FluentValidation;

namespace SecureBooking.Application.Features.Authentication.Commands.LinkGoogleAccount;

public sealed class LinkGoogleAccountCommandValidator : AbstractValidator<LinkGoogleAccountCommand>
{
    public LinkGoogleAccountCommandValidator()
    {
        RuleFor(x => x.Ticket).NotEmpty();
        RuleFor(x => x.Password).NotEmpty();
    }
}
