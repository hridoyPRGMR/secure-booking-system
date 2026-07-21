using MediatR;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Bookings;

public sealed class DeleteBookingCommandHandler(
    IRepository<Booking> repository,
    IUnitOfWork unitOfWork
) : IRequestHandler<DeleteBookingCommand, Unit>
{
    public async Task<Unit> Handle(DeleteBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Booking), request.Id);

        await repository.DeleteAsync(booking, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
