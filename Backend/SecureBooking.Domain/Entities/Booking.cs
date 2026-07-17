using System;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Domain.Entities;

public class Booking : Entity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public Guid RoomId { get; set; }
    public Room? Room { get; set; }

    public DateTime CheckIn { get; set; }

    public DateTime CheckOut { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public string? Notes { get; set; }
}
