namespace SecureBooking.Application.Features.Locations.DTOs;

public sealed record SearchLocationsResponse(
    string City,
    string Country,
    string DisplayText
);