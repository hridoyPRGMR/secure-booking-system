using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Hotels;

public sealed class UpdateHotelCommandHandler(
    IRepository<Hotel> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateHotelCommand, HotelResponse>
{
    public async Task<HotelResponse> Handle(UpdateHotelCommand request, CancellationToken cancellationToken)
    {
        var hotel = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Hotel), request.Id);

        hotel.Name = request.Name;
        hotel.Description = request.Description;
        hotel.StarRating = request.StarRating;
        hotel.ImageUrl = request.ImageUrl;
        hotel.IsActive = request.IsActive;
        hotel.LocationId = request.LocationId;

        await repository.UpdateAsync(hotel, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var location = await db.Locations.FindAsync([request.LocationId], cancellationToken)
            ?? throw new InvalidOperationException("Location vanished after validation.");
        var roomCount = await db.Rooms.CountAsync(r => r.HotelId == hotel.Id, cancellationToken);

        return new HotelResponse(
            hotel.Id, hotel.Name, hotel.Description, hotel.StarRating, hotel.ImageUrl, hotel.IsActive,
            hotel.LocationId, location.City, location.Country, roomCount, hotel.CreatedAt);
    }
}
