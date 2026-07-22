using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IUnitOfWork, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Room> Rooms { get; set; } = null!;
    public DbSet<Booking> Bookings { get; set; } = null!;
    public DbSet<Hotel> Hotels { get; set; } = null!;
    public DbSet<Location> Locations { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<Role> Roles { get; set; } = null!;
    public DbSet<Permission> Permissions { get; set; } = null!;

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
            b.Property(r => r.PricePerNight).HasPrecision(10, 2);

            b.HasOne(r => r.Hotel)
                .WithMany(h => h.Rooms)
                .HasForeignKey(r => r.HotelId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Booking>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Room).WithMany(r => r.Bookings).HasForeignKey(x => x.RoomId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Location>(b =>
        {
            b.HasKey(l => l.Id);
            b.Property(l => l.City).IsRequired().HasMaxLength(100);
            b.Property(l => l.Country).IsRequired().HasMaxLength(100);
            b.Property(l => l.Address).IsRequired().HasMaxLength(300);
        });

        modelBuilder.Entity<Hotel>(b =>
        {
            b.HasKey(h => h.Id);
            b.Property(h => h.Name).IsRequired().HasMaxLength(200);

            b.HasOne(h => h.Location)
                .WithMany(l => l.Hotels)
                .HasForeignKey(h => h.LocationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<RefreshToken>(b =>
        {
            b.HasKey(t => t.Id);
            b.Property(t => t.TokenHash).IsRequired();
            b.HasIndex(t => t.TokenHash).IsUnique();

            b.HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Permission>(b =>
        {
            b.HasKey(p => p.Id);
            b.Property(p => p.Code).IsRequired().HasMaxLength(100);
            b.Property(p => p.Area).IsRequired().HasMaxLength(100);
            b.Property(p => p.Action).IsRequired().HasMaxLength(100);
            b.Property(p => p.Description).IsRequired().HasMaxLength(500);

            b.HasIndex(p => p.Code).IsUnique();
        });

        modelBuilder.Entity<Role>(b =>
        {
            b.HasKey(r => r.Id);
            b.Property(r => r.Name).IsRequired().HasMaxLength(100);
            b.Property(r => r.Description).HasMaxLength(500);

            b.HasIndex(r => r.Name).IsUnique();

            b.Metadata.FindNavigation(nameof(Role.Permissions))!
                .SetPropertyAccessMode(PropertyAccessMode.Field);

            b.HasMany(r => r.Permissions)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "RolePermissions",
                    j => j.HasOne<Permission>().WithMany().HasForeignKey("PermissionId").OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<Role>().WithMany().HasForeignKey("RoleId").OnDelete(DeleteBehavior.Cascade),
                    j =>
                    {
                        j.HasKey("RoleId", "PermissionId");
                        j.ToTable("RolePermissions");
                    });
        });

        modelBuilder.Entity<User>(b =>
        {
            b.Metadata.FindNavigation(nameof(User.Roles))!
                .SetPropertyAccessMode(PropertyAccessMode.Field);

            b.HasMany(u => u.Roles)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "UserRoles",
                    j => j.HasOne<Role>().WithMany().HasForeignKey("RoleId").OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<User>().WithMany().HasForeignKey("UserId").OnDelete(DeleteBehavior.Cascade),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId");
                        j.ToTable("UserRoles");
                    });
        });
    }
}
