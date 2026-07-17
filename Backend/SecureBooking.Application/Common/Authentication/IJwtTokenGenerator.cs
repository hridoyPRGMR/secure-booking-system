using SecureBooking.Domain.Entities;

namespace SecureBooking.Application.Common.Authentication
{
    public interface IJwtTokenGenerator
    {
        string Generate(User user);
    }
}