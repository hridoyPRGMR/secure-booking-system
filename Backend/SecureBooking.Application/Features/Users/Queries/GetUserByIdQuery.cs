using MediatR;

namespace SecureBooking.Application.Features.Users;

public sealed record GetUserByIdQuery(Guid Id) : IRequest<UserResponse>;
