using System;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Domain.Entities;

public class Room
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public RoomType Type { get; set; }

    public string? Description { get; set; }

    public int Capacity { get; set; }

    public decimal PricePerNight { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public Guid HotelId { get; set; }
    public Hotel? Hotel { get; set; }

    public ICollection<Booking> Bookings { get; set; } = [];
}
