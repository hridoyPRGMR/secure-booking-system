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

        // BCrypt hash of "ChangeMe123!" — change this password immediately after first login.
        private const string DefaultAdminPasswordHash = "$2a$11$/DslY3vIKI8B4IuA.ZufSunPAymJn5AW9t7RQMSH2HWv.rGW2S3PO";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var now = new DateTime(2026, 7, 22, 0, 0, 0, DateTimeKind.Utc);

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "FirstName", "LastName", "Email", "PasswordHash", "IsActive", "RefreshTokenHash", "RefreshTokenExpiry", "CreatedAt", "UpdatedAt" },
                values: new object[] { DefaultAdminUserId, "Default", "Admin", "admin@securebooking.local", DefaultAdminPasswordHash, true, null, null, now, now });

            migrationBuilder.InsertData(
                table: "UserRoles",
                columns: new[] { "UserId", "RoleId" },
                values: new object[] { DefaultAdminUserId, AdministratorRoleId });
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
