using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Infrastructure.Persistence.Repositories;

public class RoomRepository(ApplicationDbContext context) : Repository<Room>(context), IRoomRepository
{
    public async Task<Room?> LockForUpdateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FromSqlInterpolated($"""SELECT * FROM "Rooms" WHERE "Id" = {id} FOR UPDATE""")
            .SingleOrDefaultAsync(cancellationToken);
    }
}
