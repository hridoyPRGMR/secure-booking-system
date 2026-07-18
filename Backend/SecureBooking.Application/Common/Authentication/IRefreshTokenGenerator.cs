using SecureBooking.Application.Common.Authentication;

namespace SecureBooking.Application.Common.Authentication;

public interface IRefreshTokenGenerator
{
    RefreshTokenResult Generate();
}