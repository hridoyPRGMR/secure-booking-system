using System.Collections.Generic;

namespace SecureBooking.Application.Common.Security;

/// <summary>Fixed catalog of every permission code known to the system. Seeded verbatim into the
/// Permissions table by the AddRolesAndPermissions migration — keep this list and the migration in sync.</summary>
public static class PermissionCatalog
{
    public static class Permissions
    {
        public const string UsersView = "Users.View";
        public const string UsersCreate = "Users.Create";
        public const string UsersUpdate = "Users.Update";
        public const string UsersDelete = "Users.Delete";

        public const string RolesView = "Roles.View";
        public const string RolesCreate = "Roles.Create";
        public const string RolesUpdate = "Roles.Update";
        public const string RolesDelete = "Roles.Delete";

        public const string LocationsView = "Locations.View";
        public const string LocationsCreate = "Locations.Create";
        public const string LocationsUpdate = "Locations.Update";
        public const string LocationsDelete = "Locations.Delete";

        public const string HotelsView = "Hotels.View";
        public const string HotelsCreate = "Hotels.Create";
        public const string HotelsUpdate = "Hotels.Update";
        public const string HotelsDelete = "Hotels.Delete";

        public const string RoomsView = "Rooms.View";
        public const string RoomsCreate = "Rooms.Create";
        public const string RoomsUpdate = "Rooms.Update";
        public const string RoomsDelete = "Rooms.Delete";

        public const string BookingsView = "Bookings.View";
        public const string BookingsCreate = "Bookings.Create";
        public const string BookingsUpdate = "Bookings.Update";
        public const string BookingsDelete = "Bookings.Delete";
    }

    public static readonly IReadOnlyList<(string Code, string Area, string Action, string Description)> All = new List<(string, string, string, string)>
    {
        (Permissions.UsersView, "Users", "View", "View users"),
        (Permissions.UsersCreate, "Users", "Create", "Create users"),
        (Permissions.UsersUpdate, "Users", "Update", "Update users"),
        (Permissions.UsersDelete, "Users", "Delete", "Delete users"),

        (Permissions.RolesView, "Roles", "View", "View roles"),
        (Permissions.RolesCreate, "Roles", "Create", "Create roles"),
        (Permissions.RolesUpdate, "Roles", "Update", "Update roles"),
        (Permissions.RolesDelete, "Roles", "Delete", "Delete roles"),

        (Permissions.LocationsView, "Locations", "View", "View locations"),
        (Permissions.LocationsCreate, "Locations", "Create", "Create locations"),
        (Permissions.LocationsUpdate, "Locations", "Update", "Update locations"),
        (Permissions.LocationsDelete, "Locations", "Delete", "Delete locations"),

        (Permissions.HotelsView, "Hotels", "View", "View hotels"),
        (Permissions.HotelsCreate, "Hotels", "Create", "Create hotels"),
        (Permissions.HotelsUpdate, "Hotels", "Update", "Update hotels"),
        (Permissions.HotelsDelete, "Hotels", "Delete", "Delete hotels"),

        (Permissions.RoomsView, "Rooms", "View", "View rooms"),
        (Permissions.RoomsCreate, "Rooms", "Create", "Create rooms"),
        (Permissions.RoomsUpdate, "Rooms", "Update", "Update rooms"),
        (Permissions.RoomsDelete, "Rooms", "Delete", "Delete rooms"),

        (Permissions.BookingsView, "Bookings", "View", "View bookings"),
        (Permissions.BookingsCreate, "Bookings", "Create", "Create bookings"),
        (Permissions.BookingsUpdate, "Bookings", "Update", "Update bookings"),
        (Permissions.BookingsDelete, "Bookings", "Delete", "Delete bookings"),
    };
}
