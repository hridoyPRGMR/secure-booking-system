using MediatR;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Rooms;

public sealed record UpdateRoomCommand(
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
