using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureBooking.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHotelSearchAndRoomConcurrency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookings_RoomId",
                table: "Bookings");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:pg_trgm", ",,");

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Rooms",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string[]>(
                name: "Amenities",
                table: "Hotels",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.AddColumn<int>(
                name: "PropertyType",
                table: "Hotels",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "ReviewScore",
                table: "Hotels",
                type: "double precision",
                precision: 3,
                scale: 1,
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateIndex(
                name: "IX_Locations_City_Country_Address",
                table: "Locations",
                columns: new[] { "City", "Country", "Address" })
                .Annotation("Npgsql:IndexMethod", "gin")
                .Annotation("Npgsql:IndexOperators", new[] { "gin_trgm_ops", "gin_trgm_ops", "gin_trgm_ops" });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_RoomId_CheckIn_CheckOut",
                table: "Bookings",
                columns: new[] { "RoomId", "CheckIn", "CheckOut" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Locations_City_Country_Address",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_RoomId_CheckIn_CheckOut",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "Amenities",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "PropertyType",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "ReviewScore",
                table: "Hotels");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:pg_trgm", ",,");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_RoomId",
                table: "Bookings",
                column: "RoomId");
        }
    }
}
