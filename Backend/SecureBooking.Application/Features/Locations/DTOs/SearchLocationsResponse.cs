namespace SecureBooking.Application.Features.Locations.DTOs;

public sealed record SearchLocationsResponse(
    Guid Id,
    string DisplayText
);