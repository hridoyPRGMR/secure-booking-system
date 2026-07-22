using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureBooking.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRolesAndPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Area = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => new { x.RoleId, x.PermissionId });
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_Code",
                table: "Permissions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles",
                column: "RoleId");

            var now = new DateTime(2026, 7, 22, 0, 0, 0, DateTimeKind.Utc);

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Code", "Area", "Action", "Description", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { PermissionIds.UsersView, "Users.View", "Users", "View", "View users", now, now },
                    { PermissionIds.UsersCreate, "Users.Create", "Users", "Create", "Create users", now, now },
                    { PermissionIds.UsersUpdate, "Users.Update", "Users", "Update", "Update users", now, now },
                    { PermissionIds.UsersDelete, "Users.Delete", "Users", "Delete", "Delete users", now, now },

                    { PermissionIds.RolesView, "Roles.View", "Roles", "View", "View roles", now, now },
                    { PermissionIds.RolesCreate, "Roles.Create", "Roles", "Create", "Create roles", now, now },
                    { PermissionIds.RolesUpdate, "Roles.Update", "Roles", "Update", "Update roles", now, now },
                    { PermissionIds.RolesDelete, "Roles.Delete", "Roles", "Delete", "Delete roles", now, now },

                    { PermissionIds.LocationsView, "Locations.View", "Locations", "View", "View locations", now, now },
                    { PermissionIds.LocationsCreate, "Locations.Create", "Locations", "Create", "Create locations", now, now },
                    { PermissionIds.LocationsUpdate, "Locations.Update", "Locations", "Update", "Update locations", now, now },
                    { PermissionIds.LocationsDelete, "Locations.Delete", "Locations", "Delete", "Delete locations", now, now },

                    { PermissionIds.HotelsView, "Hotels.View", "Hotels", "View", "View hotels", now, now },
                    { PermissionIds.HotelsCreate, "Hotels.Create", "Hotels", "Create", "Create hotels", now, now },
                    { PermissionIds.HotelsUpdate, "Hotels.Update", "Hotels", "Update", "Update hotels", now, now },
                    { PermissionIds.HotelsDelete, "Hotels.Delete", "Hotels", "Delete", "Delete hotels", now, now },

                    { PermissionIds.RoomsView, "Rooms.View", "Rooms", "View", "View rooms", now, now },
                    { PermissionIds.RoomsCreate, "Rooms.Create", "Rooms", "Create", "Create rooms", now, now },
                    { PermissionIds.RoomsUpdate, "Rooms.Update", "Rooms", "Update", "Update rooms", now, now },
                    { PermissionIds.RoomsDelete, "Rooms.Delete", "Rooms", "Delete", "Delete rooms", now, now },

                    { PermissionIds.BookingsView, "Bookings.View", "Bookings", "View", "View bookings", now, now },
                    { PermissionIds.BookingsCreate, "Bookings.Create", "Bookings", "Create", "Create bookings", now, now },
                    { PermissionIds.BookingsUpdate, "Bookings.Update", "Bookings", "Update", "Update bookings", now, now },
                    { PermissionIds.BookingsDelete, "Bookings.Delete", "Bookings", "Delete", "Delete bookings", now, now },
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Name", "Description", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { AdministratorRoleId, "Administrator", "Full system access", now, now },
                });

            migrationBuilder.InsertData(
                table: "RolePermissions",
                columns: new[] { "RoleId", "PermissionId" },
                values: new object[,]
                {
                    { AdministratorRoleId, PermissionIds.UsersView },
                    { AdministratorRoleId, PermissionIds.UsersCreate },
                    { AdministratorRoleId, PermissionIds.UsersUpdate },
                    { AdministratorRoleId, PermissionIds.UsersDelete },

                    { AdministratorRoleId, PermissionIds.RolesView },
                    { AdministratorRoleId, PermissionIds.RolesCreate },
                    { AdministratorRoleId, PermissionIds.RolesUpdate },
                    { AdministratorRoleId, PermissionIds.RolesDelete },

                    { AdministratorRoleId, PermissionIds.LocationsView },
                    { AdministratorRoleId, PermissionIds.LocationsCreate },
                    { AdministratorRoleId, PermissionIds.LocationsUpdate },
                    { AdministratorRoleId, PermissionIds.LocationsDelete },

                    { AdministratorRoleId, PermissionIds.HotelsView },
                    { AdministratorRoleId, PermissionIds.HotelsCreate },
                    { AdministratorRoleId, PermissionIds.HotelsUpdate },
                    { AdministratorRoleId, PermissionIds.HotelsDelete },

                    { AdministratorRoleId, PermissionIds.RoomsView },
                    { AdministratorRoleId, PermissionIds.RoomsCreate },
                    { AdministratorRoleId, PermissionIds.RoomsUpdate },
                    { AdministratorRoleId, PermissionIds.RoomsDelete },

                    { AdministratorRoleId, PermissionIds.BookingsView },
                    { AdministratorRoleId, PermissionIds.BookingsCreate },
                    { AdministratorRoleId, PermissionIds.BookingsUpdate },
                    { AdministratorRoleId, PermissionIds.BookingsDelete },
                });

            // Assign the Administrator role to every pre-existing user so nobody gets locked out
            // now that every endpoint requires a permission claim.
            migrationBuilder.Sql(
                $"INSERT INTO \"UserRoles\" (\"UserId\", \"RoleId\") SELECT \"Id\", '{AdministratorRoleId}' FROM \"Users\";");
        }

        private static readonly Guid AdministratorRoleId = Guid.Parse("99999999-9999-9999-9999-999999999999");

        private static class PermissionIds
        {
            public static readonly Guid UsersView = Guid.Parse("11111111-1111-1111-1111-111111111001");
            public static readonly Guid UsersCreate = Guid.Parse("11111111-1111-1111-1111-111111111002");
            public static readonly Guid UsersUpdate = Guid.Parse("11111111-1111-1111-1111-111111111003");
            public static readonly Guid UsersDelete = Guid.Parse("11111111-1111-1111-1111-111111111004");

            public static readonly Guid RolesView = Guid.Parse("11111111-1111-1111-1111-111111111005");
            public static readonly Guid RolesCreate = Guid.Parse("11111111-1111-1111-1111-111111111006");
            public static readonly Guid RolesUpdate = Guid.Parse("11111111-1111-1111-1111-111111111007");
            public static readonly Guid RolesDelete = Guid.Parse("11111111-1111-1111-1111-111111111008");

            public static readonly Guid LocationsView = Guid.Parse("11111111-1111-1111-1111-111111111009");
            public static readonly Guid LocationsCreate = Guid.Parse("11111111-1111-1111-1111-111111111010");
            public static readonly Guid LocationsUpdate = Guid.Parse("11111111-1111-1111-1111-111111111011");
            public static readonly Guid LocationsDelete = Guid.Parse("11111111-1111-1111-1111-111111111012");

            public static readonly Guid HotelsView = Guid.Parse("11111111-1111-1111-1111-111111111013");
            public static readonly Guid HotelsCreate = Guid.Parse("11111111-1111-1111-1111-111111111014");
            public static readonly Guid HotelsUpdate = Guid.Parse("11111111-1111-1111-1111-111111111015");
            public static readonly Guid HotelsDelete = Guid.Parse("11111111-1111-1111-1111-111111111016");

            public static readonly Guid RoomsView = Guid.Parse("11111111-1111-1111-1111-111111111017");
            public static readonly Guid RoomsCreate = Guid.Parse("11111111-1111-1111-1111-111111111018");
            public static readonly Guid RoomsUpdate = Guid.Parse("11111111-1111-1111-1111-111111111019");
            public static readonly Guid RoomsDelete = Guid.Parse("11111111-1111-1111-1111-111111111020");

            public static readonly Guid BookingsView = Guid.Parse("11111111-1111-1111-1111-111111111021");
            public static readonly Guid BookingsCreate = Guid.Parse("11111111-1111-1111-1111-111111111022");
            public static readonly Guid BookingsUpdate = Guid.Parse("11111111-1111-1111-1111-111111111023");
            public static readonly Guid BookingsDelete = Guid.Parse("11111111-1111-1111-1111-111111111024");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
