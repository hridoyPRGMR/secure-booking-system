using MediatR;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Hotels;

public sealed class CreateHotelCommandHandler(
    IRepository<Hotel> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<CreateHotelCommand, HotelResponse>
{
    public async Task<HotelResponse> Handle(CreateHotelCommand request, CancellationToken cancellationToken)
    {
        var hotel = new Hotel
        {
            Name = request.Name,
            Description = request.Description,
            StarRating = request.StarRating,
            ImageUrl = request.ImageUrl,
            IsActive = request.IsActive,
            LocationId = request.LocationId,
        };

        await repository.AddAsync(hotel, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var location = await db.Locations.FindAsync([request.LocationId], cancellationToken)
            ?? throw new InvalidOperationException("Location vanished after validation.");

        return new HotelResponse(
            hotel.Id, hotel.Name, hotel.Description, hotel.StarRating, hotel.ImageUrl, hotel.IsActive,
            hotel.LocationId, location.City, location.Country, 0, hotel.CreatedAt);
    }
}
