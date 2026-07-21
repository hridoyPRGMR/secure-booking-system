namespace SecureBooking.Application.Common.Exceptions;

/// <summary>Raised when an operation can't complete because of a business/data conflict (e.g. deleting a row that still has dependents).</summary>
public sealed class ConflictException(string message) : Exception(message);
