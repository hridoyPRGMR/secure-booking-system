using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;

namespace SecureBooking.Application.Features.Hotels;

public sealed class CreateHotelCommandValidator : AbstractValidator<CreateHotelCommand>
{
    public CreateHotelCommandValidator(IApplicationDbContext db)
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.StarRating).InclusiveBetween(1, 5);
        RuleFor(x => x.LocationId).NotEmpty();
        RuleFor(x => x.LocationId)
            .MustAsync(async (id, ct) => await db.Locations.AnyAsync(l => l.Id == id, ct))
            .WithMessage("The selected location does not exist.");
    }
}
