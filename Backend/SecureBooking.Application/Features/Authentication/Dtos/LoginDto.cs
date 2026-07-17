using System.ComponentModel.DataAnnotations;

namespace SecureBooking.Application.Features.Authentication.Dtos
{
    public record LoginDto(
        [Required, EmailAddress] string Email,
        [Required, MaxLength(50)] string Password
    );
}