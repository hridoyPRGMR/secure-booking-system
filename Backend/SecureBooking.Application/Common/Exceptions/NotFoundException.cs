namespace SecureBooking.Application.Common.Exceptions;

public sealed class NotFoundException(string entityName, Guid id)
    : Exception($"{entityName} with id '{id}' was not found.");
