using FluentValidation;

namespace SecureBooking.Application.Features.Authentication.Commands.Register;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x=> x.FirstName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x=> x.LastName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x=> x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x=> x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain one uppercase later.")
            .Matches("[a-z]").WithMessage("Password must contain one lowercase later.")
            .Matches("[0-9]").WithMessage("Password must contain one number.");
    }
}