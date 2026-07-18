using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SecureBooking.Application.Common.Authentication;
using SecureBooking.Application.Features.Authentication;
using SecureBooking.Domain.Entities;

namespace SecureBooking.Infrastructure.Authentication
{
    public class JwtTokenGenerator(IOptions<JwtSettings> jwtSettings) : IJwtTokenGenerator
    {
        private readonly JwtSettings _jwtSettings = jwtSettings.Value;

        public DateTime AccessTokenExpiresAt { get; private set; }

        public TokenResult Generate(User user)
        {
            var expiresAt = DateTime.UtcNow.AddMinutes(
                _jwtSettings.AccessTokenExpirationMinutes);
            
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.GivenName, user.FirstName),
                new Claim(JwtRegisteredClaimNames.FamilyName, user.LastName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_jwtSettings.Secret));

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: credentials);

            var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

            return TokenResult.FromAccessToken(accessToken,expiresAt);
        }
    }
}