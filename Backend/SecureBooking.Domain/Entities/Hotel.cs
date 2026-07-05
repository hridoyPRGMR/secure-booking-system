namespace SecureBooking.Domain.Entities;

public class Hotel
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public int StarRating { get; set; } // 1-5

    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public Guid LocationId { get; set; }
    public Location? Location { get; set; }

    public ICollection<Room> Rooms { get; set; } = [];
}