namespace SecureBooking.Application.Features.Users;

public sealed record UserResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    bool IsActive,
    DateTime CreatedAt
);

/// <summary>Returned only from Create — the temp password must be shared with the admin once, it's never retrievable again.</summary>
public sealed record CreateUserResult(UserResponse User, string TemporaryPassword);
