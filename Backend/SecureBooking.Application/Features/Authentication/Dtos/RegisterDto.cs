using System.ComponentModel.DataAnnotations;

namespace SecureBooking.Application.Features.Authentication.Dtos
{
    public record RegisterDto(
        [Required, EmailAddress] string Email,
        [Required, MaxLength(100)] string FirstName,
        [Required, MaxLength(100)] string LastName,
        [Required, MinLength(8), MaxLength(50)] string Password,
        [Required, MinLength(8), MaxLength(50)] string ConfirmPassword
    );
}