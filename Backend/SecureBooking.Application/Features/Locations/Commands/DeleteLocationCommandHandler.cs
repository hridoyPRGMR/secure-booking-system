using MediatR;
using Microsoft.EntityFrameworkCore;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Locations;

public sealed class DeleteLocationCommandHandler(
    IRepository<Location> repository,
    IApplicationDbContext db,
    IUnitOfWork unitOfWork
) : IRequestHandler<DeleteLocationCommand, Unit>
{
    public async Task<Unit> Handle(DeleteLocationCommand request, CancellationToken cancellationToken)
    {
        var location = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Location), request.Id);

        var hasHotels = await db.Hotels.AnyAsync(h => h.LocationId == request.Id, cancellationToken);
        if (hasHotels)
            throw new ConflictException("Cannot delete a location that still has hotels assigned to it.");

        await repository.DeleteAsync(location, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
