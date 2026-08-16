using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Application.Features.Bookings.Commands.CreateBooking;

namespace SecureBooking.Application.Features.Bookings.Commands.CreateMyBooking;

public sealed class CreateMyBookingCommandValidator : AbstractValidator<CreateMyBookingCommand>
{
    public CreateMyBookingCommandValidator(IApplicationDbContext db)
    {
        RuleFor(x => x.RoomId).NotEmpty();
        RuleFor(x => x.RoomId)
            .MustAsync(async (id, ct) => await db.Rooms.AnyAsync(r => r.Id == id && r.IsActive, ct))
            .WithMessage("The selected room does not exist or is not available.");

        RuleFor(x => x.CheckIn).GreaterThanOrEqualTo(DateTime.UtcNow.Date)
            .WithMessage("Check-in must not be in the past.");

        RuleFor(x => x.CheckOut).GreaterThan(x => x.CheckIn)
            .WithMessage("Check-out must be after check-in.");

        RuleFor(x => x)
            .MustAsync(async (cmd, ct) => !await CreateBookingCommandValidator.HasOverlapAsync(db, cmd.RoomId, cmd.CheckIn, cmd.CheckOut, null, ct))
            .WithMessage("This room is already booked for part of the selected date range.")
            .WithName("RoomId");
    }
}
