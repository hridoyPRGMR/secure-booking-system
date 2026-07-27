using MediatR;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Rooms.Commands.Update;

public sealed record Command(
    Guid Id,
    string Name,
    RoomType Type,
    string? Description,
    int Capacity,
    decimal PricePerNight,
    string? ImageUrl,
    bool IsActive,
    Guid HotelId
) : IRequest<RoomResponse>;
