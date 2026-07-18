using System.Security.Cryptography;
using System.Text;
using SecureBooking.Application.Common.Authentication;

namespace SecureBooking.Infrastructure.Authentication;

public class RefreshTokenGenerator : IRefreshTokenGenerator
{
    public RefreshTokenResult Generate()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);

        var token = Convert.ToBase64String(bytes);

        var hash = Convert.ToHexString(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(token)));

        return new RefreshTokenResult(
            token,
            hash,
            DateTime.UtcNow.AddDays(30));
    }
}