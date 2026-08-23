using System.Text.Json;
using NBomber.Contracts;
using NBomber.CSharp;
using NBomber.Http;
using NBomber.Http.CSharp;

namespace SecureBooking.LoadTests.Scenarios;

public static class PublicCatalogScenarios
{
    private static readonly string[] HotelSortFields = ["name", "starrating", "review", "price", "createdat"];

    public static ScenarioProps HotelsList(LoadTestOptions options, int rate)
    {
        var httpClient = Http.CreateDefaultClient();

        return Scenario.Create("hotels_list", async context =>
        {
            var city = "Dhaka"; 
            
            var page = Random.Shared.Next(1, 11);
            var pageSize = 10 * Random.Shared.Next(1, 4);
            var sortBy = HotelSortFields[Random.Shared.Next(HotelSortFields.Length)];
            var checkIn = DateTime.UtcNow.Date.AddDays(Random.Shared.Next(7, 30)).ToString("yyyy-MM-dd");
            var checkOut = DateTime.UtcNow.Date.AddDays(Random.Shared.Next(31, 60)).ToString("yyyy-MM-dd");
            var children = Random.Shared.Next(0, 3);
            var adults = Random.Shared.Next(1, 4);
            var rooms = Random.Shared.Next(1, 3); 

            var request = HttpSteps.CreateRequest("GET",
                $"{options.BaseUrl}/api/public/hotels?page={page}&pageSize={pageSize}&sortBy={sortBy}&checkIn={checkIn}&checkOut={checkOut}&rooms={rooms}&adults={adults}&children={children}");

            return await HttpSteps.SendAsync(httpClient, request);
        })
        .WithLoadSimulations(SimulationPlan.Create(rate, options));
    }

//    adults=16&children=10&rooms=10&starRatings=5&checkIn=2026-08-26T00:00:00.000Z&checkOut=2026-08-27T00:00:00.000Z&page=1&pageSize=12


    public static ScenarioProps HotelDetailsFlow(LoadTestOptions options, int rate)
    {
        var httpClient = Http.CreateDefaultClient();

        return Scenario.Create("hotel_details_flow", async context =>
        {
            Guid hotelId = Guid.Empty;

            var listStep = await Step.Run("list_hotels", context, async () =>
            {
                var page = Random.Shared.Next(1, 6);
                var request = HttpSteps.CreateRequest("GET",
                    $"{options.BaseUrl}/api/public/hotels?page={page}&pageSize=20");

                var response = await Http.Send(httpClient, request);

                if (!response.IsError)
                {
                    var httpResponse = response.Payload.Value;
                    var body = await httpResponse.Content.ReadAsStringAsync();
                    using var document = JsonDocument.Parse(body);

                    if (document.RootElement.TryGetProperty("items", out var items) &&
                        items.GetArrayLength() > 0)
                    {
                        hotelId = items[Random.Shared.Next(items.GetArrayLength())]
                            .GetProperty("id")
                            .GetGuid();
                    }
                }

                return response;
            });

            var detailsStep = await Step.Run("get_hotel_details", context, async () =>
            {
                var request = HttpSteps.CreateRequest("GET",
                    $"{options.BaseUrl}/api/public/hotels/{hotelId}");

                return await HttpSteps.SendAsync(httpClient, request);
            });

            return Response.Ok();
        })
        .WithLoadSimulations(SimulationPlan.Create(rate, options));
    }

    public static ScenarioProps RoomsAvailabilitySearch(LoadTestOptions options, int rate)
    {
        var httpClient = Http.CreateDefaultClient();

        return Scenario.Create("rooms_availability_search", async context =>
        {
            var checkIn = DateTime.UtcNow.Date.AddDays(Random.Shared.Next(7, 30));
            var checkOut = checkIn.AddDays(Random.Shared.Next(2, 8));
            var page = Random.Shared.Next(1, 6);

            var request = HttpSteps.CreateRequest("GET",
                $"{options.BaseUrl}/api/public/rooms?page={page}&pageSize=20&checkIn={checkIn:yyyy-MM-dd}&checkOut={checkOut:yyyy-MM-dd}");

            return await HttpSteps.SendAsync(httpClient, request);
        })
        .WithLoadSimulations(SimulationPlan.Create(rate, options));
    }

    public static ScenarioProps LocationsSearch(LoadTestOptions options, int rate)
    {
        var httpClient = Http.CreateDefaultClient();

        return Scenario.Create("locations_search", async context =>
        {
            var search = ((char)('a' + Random.Shared.Next(0, 26))).ToString();

            var request = HttpSteps.CreateRequest("GET",
                $"{options.BaseUrl}/api/public/locations?search={search}");

            return await HttpSteps.SendAsync(httpClient, request);
        })
        .WithLoadSimulations(SimulationPlan.Create(rate, options));
    }
}
