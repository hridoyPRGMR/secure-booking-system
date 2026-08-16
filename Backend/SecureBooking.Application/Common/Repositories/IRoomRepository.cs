using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Common.Repositories;

public interface IRoomRepository : IRepository<Room>
{
    /// <summary>Locks the room's row (Postgres <c>SELECT ... FOR UPDATE</c>) so concurrent
    /// transactions attempting to book the same room block until this transaction commits
    /// or rolls back. Must be called inside an active transaction
    /// (<see cref="IUnitOfWork.BeginTransactionAsync"/>). Returns null if the room doesn't exist.</summary>
    Task<Room?> LockForUpdateAsync(Guid id, CancellationToken cancellationToken = default);
}
