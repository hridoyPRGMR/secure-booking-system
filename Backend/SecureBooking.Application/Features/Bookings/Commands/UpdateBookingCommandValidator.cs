using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Bookings;

public sealed class UpdateBookingCommandValidator : AbstractValidator<UpdateBookingCommand>
{
    public UpdateBookingCommandValidator(IApplicationDbContext db)
    {
        RuleFor(x => x.Id).NotEmpty();

        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.UserId)
            .MustAsync(async (id, ct) => await db.Users.AnyAsync(u => u.Id == id, ct))
            .WithMessage("The selected user does not exist.");

        RuleFor(x => x.RoomId).NotEmpty();
        RuleFor(x => x.RoomId)
            .MustAsync(async (id, ct) => await db.Rooms.AnyAsync(r => r.Id == id, ct))
            .WithMessage("The selected room does not exist.");

        RuleFor(x => x.CheckOut).GreaterThan(x => x.CheckIn)
            .WithMessage("Check-out must be after check-in.");

        RuleFor(x => x.Status).IsInEnum();

        RuleFor(x => x)
            .MustAsync(async (cmd, ct) =>
                !await CreateBookingCommandValidator.HasOverlapAsync(db, cmd.RoomId, cmd.CheckIn, cmd.CheckOut, cmd.Id, ct))
            .WithMessage("This room is already booked for part of the selected date range.")
            .WithName("RoomId");
    }
}
