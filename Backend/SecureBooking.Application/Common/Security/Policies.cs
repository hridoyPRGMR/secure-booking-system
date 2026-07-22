namespace SecureBooking.Application.Common.Security;

/// <summary>Authorization policy names, one per permission code. Policy names follow the
/// "Permission:{code}" convention consumed by PermissionPolicyProvider (Infrastructure layer),
/// which auto-generates a matching policy on first use — nothing needs to be registered by hand.</summary>
public static class Policies
{
    public const string UsersView = "Permission:Users.View";
    public const string UsersCreate = "Permission:Users.Create";
    public const string UsersUpdate = "Permission:Users.Update";
    public const string UsersDelete = "Permission:Users.Delete";

    public const string RolesView = "Permission:Roles.View";
    public const string RolesCreate = "Permission:Roles.Create";
    public const string RolesUpdate = "Permission:Roles.Update";
    public const string RolesDelete = "Permission:Roles.Delete";

    public const string LocationsView = "Permission:Locations.View";
    public const string LocationsCreate = "Permission:Locations.Create";
    public const string LocationsUpdate = "Permission:Locations.Update";
    public const string LocationsDelete = "Permission:Locations.Delete";

    public const string HotelsView = "Permission:Hotels.View";
    public const string HotelsCreate = "Permission:Hotels.Create";
    public const string HotelsUpdate = "Permission:Hotels.Update";
    public const string HotelsDelete = "Permission:Hotels.Delete";

    public const string RoomsView = "Permission:Rooms.View";
    public const string RoomsCreate = "Permission:Rooms.Create";
    public const string RoomsUpdate = "Permission:Rooms.Update";
    public const string RoomsDelete = "Permission:Rooms.Delete";

    public const string BookingsView = "Permission:Bookings.View";
    public const string BookingsCreate = "Permission:Bookings.Create";
    public const string BookingsUpdate = "Permission:Bookings.Update";
    public const string BookingsDelete = "Permission:Bookings.Delete";
}
