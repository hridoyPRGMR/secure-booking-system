using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SecureBooking.Domain.Entities;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Infrastructure.Persistence.Seed;

/// <summary>
/// Generates ~100k rows of example data (Users, Locations, Hotels, Rooms, Bookings)
/// for local load-testing / demo purposes. Idempotent: skipped once Users already
/// meets UserCount, so it only runs once against a fresh database.
/// </summary>
public static class LargeDataSeeder
{
    private const int UserCount = 100_000;
    private const int LocationCount = 50;
    private const int HotelCount = 200;
    private const int RoomCount = 2_000;
    private const int BookingCount = 50_000;
    private const int BatchSize = 2_000;

    // BCrypt hash of "Password123!" - shared by all seeded users, hashed once for speed.
    private const string SeedUserPasswordHash = "$2a$11$ldpMMEtVAv7G.g2PffJeW.wuvYGyiXicfz50lajxDdWEpZaOGJv2u";

    private static readonly string[] Cities =
    [
        "Dhaka", "Chattogram", "Sylhet", "Cox's Bazar", "Khulna",
        "Rajshahi", "Barishal", "Rangpur", "Mymensingh", "Comilla"
    ];

    private static readonly string[] Countries = ["Bangladesh"];

    private static readonly string[] HotelAdjectives =
        ["Grand", "Royal", "Ocean View", "Golden", "Sunset", "Palm", "Riverside", "Emerald", "Skyline", "Heritage"];

    private static readonly string[] HotelNouns =
        ["Hotel", "Resort", "Inn", "Suites", "Palace", "Residency", "Retreat"];

    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger, CancellationToken cancellationToken = default)
    {
        if (await context.Users.CountAsync(cancellationToken) >= UserCount)
        {
            logger.LogInformation("Large dataset already present, skipping seed.");
            return;
        }

        logger.LogInformation("Seeding example dataset: {Users} users, {Bookings} bookings...", UserCount, BookingCount);

        var random = new Random(12345);

        var locationIds = await SeedLocationsAsync(context, cancellationToken);
        var hotelIds = await SeedHotelsAsync(context, locationIds, random, cancellationToken);
        var roomIds = await SeedRoomsAsync(context, hotelIds, random, cancellationToken);
        var userIds = await SeedUsersAsync(context, cancellationToken);
        await SeedBookingsAsync(context, userIds, roomIds, random, cancellationToken);

        logger.LogInformation("Finished seeding example dataset.");
    }

    private static async Task<List<Guid>> SeedLocationsAsync(ApplicationDbContext context, CancellationToken cancellationToken)
    {
        var ids = new List<Guid>(LocationCount);
        var pending = 0;

        for (var i = 0; i < LocationCount; i++)
        {
            var location = new Location
            {
                City = Cities[i % Cities.Length],
                Country = Countries[0],
                Address = $"{i + 1} Example Street",
                Latitude = 20 + (i % 10),
                Longitude = 88 + (i % 10)
            };

            context.Locations.Add(location);
            ids.Add(location.Id);
            pending++;

            if (pending == BatchSize)
            {
                pending = await FlushAsync(context, pending, cancellationToken);
            }
        }

        await FlushAsync(context, pending, cancellationToken);
        return ids;
    }

    private static async Task<List<Guid>> SeedHotelsAsync(
        ApplicationDbContext context, List<Guid> locationIds, Random random, CancellationToken cancellationToken)
    {
        var ids = new List<Guid>(HotelCount);
        var pending = 0;

        for (var i = 0; i < HotelCount; i++)
        {
            var hotel = new Hotel
            {
                Name = $"{HotelAdjectives[i % HotelAdjectives.Length]} {HotelNouns[i % HotelNouns.Length]} {i + 1}",
                Description = "Example seeded hotel for demo/testing purposes.",
                StarRating = random.Next(1, 6),
                IsActive = true,
                LocationId = locationIds[i % locationIds.Count]
            };

            context.Hotels.Add(hotel);
            ids.Add(hotel.Id);
            pending++;

            if (pending == BatchSize)
            {
                pending = await FlushAsync(context, pending, cancellationToken);
            }
        }

        await FlushAsync(context, pending, cancellationToken);
        return ids;
    }

    private static async Task<List<Guid>> SeedRoomsAsync(
        ApplicationDbContext context, List<Guid> hotelIds, Random random, CancellationToken cancellationToken)
    {
        var roomTypes = Enum.GetValues<RoomType>();
        var ids = new List<Guid>(RoomCount);
        var pending = 0;

        for (var i = 0; i < RoomCount; i++)
        {
            var room = new Room
            {
                Name = $"Room {i + 1}",
                Type = roomTypes[i % roomTypes.Length],
                Description = "Example seeded room for demo/testing purposes.",
                Capacity = random.Next(1, 5),
                PricePerNight = 30 + random.Next(0, 300),
                IsActive = true,
                HotelId = hotelIds[i % hotelIds.Count]
            };

            context.Rooms.Add(room);
            ids.Add(room.Id);
            pending++;

            if (pending == BatchSize)
            {
                pending = await FlushAsync(context, pending, cancellationToken);
            }
        }

        await FlushAsync(context, pending, cancellationToken);
        return ids;
    }

    private static async Task<List<Guid>> SeedUsersAsync(ApplicationDbContext context, CancellationToken cancellationToken)
    {
        var ids = new List<Guid>(UserCount);
        var pending = 0;

        for (var i = 1; i <= UserCount; i++)
        {
            var user = new User($"User{i}", $"Test{i}", $"user{i}@example.com", SeedUserPasswordHash);

            context.Users.Add(user);
            ids.Add(user.Id);
            pending++;

            if (pending == BatchSize)
            {
                pending = await FlushAsync(context, pending, cancellationToken);
            }
        }

        await FlushAsync(context, pending, cancellationToken);
        return ids;
    }

    private static async Task SeedBookingsAsync(
        ApplicationDbContext context, List<Guid> userIds, List<Guid> roomIds, Random random, CancellationToken cancellationToken)
    {
        var statuses = Enum.GetValues<BookingStatus>();
        var pending = 0;

        for (var i = 0; i < BookingCount; i++)
        {
            var checkIn = DateTime.UtcNow.Date.AddDays(random.Next(-30, 60));

            context.Bookings.Add(new Booking
            {
                UserId = userIds[random.Next(userIds.Count)],
                RoomId = roomIds[random.Next(roomIds.Count)],
                CheckIn = checkIn,
                CheckOut = checkIn.AddDays(random.Next(1, 14)),
                Status = statuses[i % statuses.Length],
                Notes = "Example seeded booking for demo/testing purposes."
            });
            pending++;

            if (pending == BatchSize)
            {
                pending = await FlushAsync(context, pending, cancellationToken);
            }
        }

        await FlushAsync(context, pending, cancellationToken);
    }

    private static async Task<int> FlushAsync(ApplicationDbContext context, int pending, CancellationToken cancellationToken)
    {
        if (pending == 0)
        {
            return 0;
        }

        await context.SaveChangesAsync(cancellationToken);
        context.ChangeTracker.Clear();
        return 0;
    }
}
