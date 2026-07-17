namespace SecureBooking.Domain.Entities;


public class Location : Entity
{
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public ICollection<Hotel> Hotels { get; set; } = [];
}