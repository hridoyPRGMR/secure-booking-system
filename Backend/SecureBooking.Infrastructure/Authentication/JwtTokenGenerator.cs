using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
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
            
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email),
                new(JwtRegisteredClaimNames.GivenName, user.FirstName),
                new(JwtRegisteredClaimNames.FamilyName, user.LastName),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var role in user.Roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role.Name));
            }

            var permissionCodes = user.Roles
                .SelectMany(r => r.Permissions)
                .Select(p => p.Code)
                .Distinct();

            foreach (var permissionCode in permissionCodes)
            {
                claims.Add(new Claim("permission", permissionCode));
            }

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