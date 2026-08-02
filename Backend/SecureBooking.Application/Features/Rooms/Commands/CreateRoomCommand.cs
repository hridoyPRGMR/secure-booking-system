using MediatR;
using SecureBooking.Application.Features.Rooms.DTOs;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Rooms.Commands;

public sealed record CreateRoomCommand(
    string Name,
    RoomType Type,
    string? Description,
    int Capacity,
    decimal PricePerNight,
    string? ImageUrl,
    bool IsActive,
    Guid HotelId
) : IRequest<RoomResponse>;
