using MediatR;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;
using SecureBooking.Shared.Enums;

namespace SecureBooking.Application.Features.Bookings;

public sealed class CancelMyBookingCommandHandler(
    IRepository<Booking> repository,
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser
) : IRequestHandler<CancelMyBookingCommand, Unit>
{
    public async Task<Unit> Handle(CancelMyBookingCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId
            ?? throw new UnauthorizedAccessException("No authenticated user.");

        var booking = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (booking is null || booking.UserId != userId)
            throw new NotFoundException(nameof(Booking), request.Id);

        booking.Status = BookingStatus.Cancelled;

        await repository.UpdateAsync(booking, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
