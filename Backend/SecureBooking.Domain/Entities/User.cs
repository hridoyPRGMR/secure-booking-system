using System;
using System.Collections.Generic;

namespace SecureBooking.Domain.Entities;

public class User : Entity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; }
    public string PasswordHash { get; private set; } = default!;
    public bool IsActive { get; private set; }

    public string? RefreshTokenHash { get; private set; }
    public DateTime? RefreshTokenExpiry { get; private set; }

    private readonly List<Role> _roles = new();
    public IReadOnlyCollection<Role> Roles => _roles.AsReadOnly();

    private User() { }

    public User(
        string firstName,
        string lastName,
        string email,
        string passwordHash
    )
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email.ToLowerInvariant();
        PasswordHash = passwordHash;
        IsActive = true;
    }

    public void ChangePassword(string passwordHash)
    {
        PasswordHash = passwordHash;
    }

    public void SetRefreshToken(string tokenHash, DateTime expiry)
    {
        RefreshTokenHash = tokenHash;
        RefreshTokenExpiry = expiry;
    }

    public void SetRoles(IEnumerable<Role> roles)
    {
        _roles.Clear();
        _roles.AddRange(roles);
    }
}
