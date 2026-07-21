using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Hotels;

public sealed class GetHotelByIdQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetHotelByIdQuery, HotelResponse>
{
    public async Task<HotelResponse> Handle(GetHotelByIdQuery request, CancellationToken cancellationToken)
    {
        var hotel = await db.Hotels
            .AsNoTracking()
            .Where(h => h.Id == request.Id)
            .Select(h => new HotelResponse(
                h.Id, h.Name, h.Description, h.StarRating, h.ImageUrl, h.IsActive,
                h.LocationId, h.Location!.City, h.Location.Country, h.Rooms.Count, h.CreatedAt))
            .FirstOrDefaultAsync(cancellationToken);

        return hotel ?? throw new NotFoundException(nameof(Hotel), request.Id);
    }
}
