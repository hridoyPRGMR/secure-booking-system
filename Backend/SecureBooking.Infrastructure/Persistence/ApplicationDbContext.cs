using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Room> Rooms { get; set; } = null!;
    public DbSet<Booking> Bookings { get; set; } = null!;

    Task<int>IUnitOfWork.SaveChangesAsync(CancellationToken cancellationToken)
        => base.SaveChangesAsync(cancellationToken);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(u => u.Id);
            b.Property(u => u.Email).IsRequired().HasMaxLength(256);
            b.Property(u=> u.FirstName).IsRequired().HasMaxLength(100);
            b.Property(u=> u.LastName).IsRequired().HasMaxLength(100);
            b.Property(u=> u.PasswordHash).IsRequired().HasMaxLength(256);

            b.HasIndex(u=> u.Email).IsUnique();
        });

        modelBuilder.Entity<Room>(b =>
        {
            b.HasKey(r => r.Id);
            b.Property(r => r.Name).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<Booking>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
            b.HasOne(x => x.Room).WithMany().HasForeignKey(x => x.RoomId);
        });
    }
}
