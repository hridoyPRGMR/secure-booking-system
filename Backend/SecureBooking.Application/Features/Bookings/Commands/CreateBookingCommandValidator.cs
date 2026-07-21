using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Bookings;

public sealed class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator(IApplicationDbContext db)
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.UserId)
            .MustAsync(async (id, ct) => await db.Users.AnyAsync(u => u.Id == id, ct))
            .WithMessage("The selected user does not exist.");

        RuleFor(x => x.RoomId).NotEmpty();
        RuleFor(x => x.RoomId)
            .MustAsync(async (id, ct) => await db.Rooms.AnyAsync(r => r.Id == id, ct))
            .WithMessage("The selected room does not exist.");

        RuleFor(x => x.CheckIn).GreaterThanOrEqualTo(DateTime.UtcNow.Date)
            .WithMessage("Check-in must not be in the past.");

        RuleFor(x => x.CheckOut).GreaterThan(x => x.CheckIn)
            .WithMessage("Check-out must be after check-in.");

        RuleFor(x => x.Status).IsInEnum();

        RuleFor(x => x)
            .MustAsync(async (cmd, ct) => !await HasOverlapAsync(db, cmd.RoomId, cmd.CheckIn, cmd.CheckOut, null, ct))
            .WithMessage("This room is already booked for part of the selected date range.")
            .WithName("RoomId");
    }

    internal static async Task<bool> HasOverlapAsync(
        IApplicationDbContext db, Guid roomId, DateTime checkIn, DateTime checkOut, Guid? excludeBookingId, CancellationToken ct)
    {
        return await db.Bookings.AnyAsync(b =>
            b.RoomId == roomId &&
            b.Status != Shared.Enums.BookingStatus.Cancelled &&
            (excludeBookingId == null || b.Id != excludeBookingId) &&
            b.CheckIn < checkOut &&
            checkIn < b.CheckOut,
            ct);
    }
}
