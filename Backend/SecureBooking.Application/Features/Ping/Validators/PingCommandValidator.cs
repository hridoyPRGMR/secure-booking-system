using FluentValidation;

namespace SecureBooking.Application.Features.Ping.Commands;

public sealed class PingCommandValidator : AbstractValidator<PingCommand>
{
    public PingCommandValidator()
    {
        RuleFor(x => x.Message).NotEmpty().WithMessage("Message is required.");
    }
}
