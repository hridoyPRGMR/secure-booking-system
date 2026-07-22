using System;
using System.Collections.Generic;
using System.Linq;

namespace SecureBooking.Domain.Entities;

public class Role : Entity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    private readonly List<Permission> _permissions = new();
    public IReadOnlyCollection<Permission> Permissions => _permissions.AsReadOnly();

    private Role() { }

    public Role(string name, string description)
    {
        Name = name;
        Description = description;
    }

    public void UpdateDetails(string name, string description)
    {
        Name = name;
        Description = description;
    }

    public void SetPermissions(IEnumerable<Permission> permissions)
    {
        _permissions.Clear();
        _permissions.AddRange(permissions);
    }
}
