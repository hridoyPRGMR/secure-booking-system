using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Rooms;

public sealed class UpdateRoomCommandValidator : AbstractValidator<UpdateRoomCommand>
{
    public UpdateRoomCommandValidator(IApplicationDbContext db)
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.Capacity).GreaterThan(0);
        RuleFor(x => x.PricePerNight).GreaterThan(0);
        RuleFor(x => x.HotelId).NotEmpty();
        RuleFor(x => x.HotelId)
            .MustAsync(async (id, ct) => await db.Hotels.AnyAsync(h => h.Id == id, ct))
            .WithMessage("The selected hotel does not exist.");
    }
}
