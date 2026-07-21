using MediatR;
using SecureBooking.Application.Common.Exceptions;
using SecureBooking.Application.Common.Repositories;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Features.Users;

public sealed class UpdateUserCommandHandler(
    IRepository<User> repository,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateUserCommand, UserResponse>
{
    public async Task<UserResponse> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(User), request.Id);

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email.ToLowerInvariant();

        await repository.UpdateAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new UserResponse(user.Id, user.FirstName, user.LastName, user.Email, user.IsActive, user.CreatedAt);
    }
}
