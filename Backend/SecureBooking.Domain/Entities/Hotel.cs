namespace SecureBooking.Domain.Entities;

using SecureBooking.Shared.Enums;

public class Hotel : Entity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public int StarRating { get; set; } // 1-5

    public double ReviewScore { get; set; } // 0-10 guest review score

    public PropertyType PropertyType { get; set; } = PropertyType.Hotel;

    public ICollection<string> Amenities { get; set; } = [];

    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public Guid LocationId { get; set; }
    public Location? Location { get; set; }

    public ICollection<Room> Rooms { get; set; } = [];
}