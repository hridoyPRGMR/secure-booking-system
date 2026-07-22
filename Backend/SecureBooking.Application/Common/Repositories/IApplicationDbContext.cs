using Microsoft.EntityFrameworkCore;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Common.Repositories;

/// <summary>
/// Read-side access to the persistence store for query handlers. Command handlers
/// go through <see cref="IRepository{T}"/> + <see cref="IUnitOfWork"/> instead — this
/// interface exists purely so query handlers (which need flexible projections/joins/paging)
/// can use EF Core's LINQ provider without the Application layer depending on Infrastructure.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Room> Rooms { get; }
    DbSet<Booking> Bookings { get; }
    DbSet<Hotel> Hotels { get; }
    DbSet<Location> Locations { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
}
