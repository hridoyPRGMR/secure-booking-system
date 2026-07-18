using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Common.Authentication
{
    public interface IJwtTokenGenerator
    {
        TokenResult Generate(User user);
    }
}