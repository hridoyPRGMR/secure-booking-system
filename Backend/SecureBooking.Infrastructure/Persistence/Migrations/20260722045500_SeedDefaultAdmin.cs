using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureBooking.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedDefaultAdmin : Migration
    {
        private static readonly Guid DefaultAdminUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        private static readonly Guid AdministratorRoleId = Guid.Parse("99999999-9999-9999-9999-999999999999");

        // No longer inserts a default admin (it shipped a well-known password).
        // The initial admin is now created from configuration by AdminSeeder.
        // Databases that already applied this migration keep their existing row.
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UserRoles",
                keyColumns: new[] { "UserId", "RoleId" },
                keyValues: new object[] { DefaultAdminUserId, AdministratorRoleId });

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: DefaultAdminUserId);
        }
    }
}
