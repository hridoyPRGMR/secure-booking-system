using System;

namespace SecureBooking.Domain.Entities;

public class Permission : Entity
{
    public string Code { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    private Permission() { }

    public Permission(string code, string area, string action, string description)
    {
        Code = code;
        Area = area;
        Action = action;
        Description = description;
    }
}
