namespace SecureBooking.Application.Common.Authentication;

/// <summary>A validated identity asserted by an external provider.</summary>
public sealed record ExternalIdentity(
    string Provider,
    string ProviderUserId,
    string Email,
    bool EmailVerified,
    string? FirstName,
    string? LastName,
    string? PictureUrl);
