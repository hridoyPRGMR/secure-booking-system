using MediatR;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Rooms.Commands.Create;

public sealed record Command(
    string Name,
    RoomType Type,
    string? Description,
    int Capacity,
    decimal PricePerNight,
    string? ImageUrl,
    bool IsActive,
    Guid HotelId
) : IRequest<RoomResponse>;
