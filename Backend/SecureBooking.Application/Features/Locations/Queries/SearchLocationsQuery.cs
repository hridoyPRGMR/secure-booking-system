using MediatR;
using SecureBooking.Application.Common.Models;
using SecureBooking.Application.Features.Locations.DTOs;

namespace SecureBooking.Application.Features.Locations.Queries;

public sealed record SearchLocationsQuery(
    int Limit = 30,
    string? Search = null
) : IRequest<List<SearchLocationsResponse>>;