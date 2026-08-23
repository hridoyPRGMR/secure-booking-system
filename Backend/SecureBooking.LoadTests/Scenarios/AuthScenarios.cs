using System.Text;
using System.Text.Json;
using NBomber.Contracts;
using NBomber.CSharp;
using NBomber.Http;
using NBomber.Http.CSharp;

namespace SecureBooking.LoadTests.Scenarios;

public static class AuthScenarios
{
    public static ScenarioProps Login(LoadTestOptions options, int rate)
    {
        var httpClient = Http.CreateDefaultClient();

        return Scenario.Create("login", async context =>
        {
            var request = HttpSteps.CreateRequest("POST", $"{options.BaseUrl}/api/auth/login")
                .WithHeader("Content-Type", "application/json")
                .WithBody(new StringContent(
                    JsonSerializer.Serialize(new
                    {
                        email = options.TestUserEmail,
                        password = options.TestUserPassword,
                    }),
                    Encoding.UTF8,
                    "application/json"));

            return await HttpSteps.SendAsync(httpClient, request);
        })
        .WithLoadSimulations(SimulationPlan.Create(rate, options));
    }

    public static ScenarioProps BookingsMineFlow(LoadTestOptions options, int rate)
    {
        var httpClient = Http.CreateDefaultClient();

        return Scenario.Create("bookings_mine_flow", async context =>
        {
            string accessToken = string.Empty;

            var loginStep = await Step.Run("login", context, async () =>
            {
                var request = HttpSteps.CreateRequest("POST", $"{options.BaseUrl}/api/auth/login")
                    .WithHeader("Content-Type", "application/json")
                    .WithBody(new StringContent(
                        JsonSerializer.Serialize(new
                        {
                            email = options.TestUserEmail,
                            password = options.TestUserPassword,
                        }),
                        Encoding.UTF8,
                        "application/json"));

                var response = await Http.Send(httpClient, request);

                if (!response.IsError)
                {
                    var body = await response.Payload.Value.Content.ReadAsStringAsync();
                    using var document = JsonDocument.Parse(body);
                    accessToken = document.RootElement.GetProperty("accessToken").GetString() ?? string.Empty;
                }

                return response;
            });

            var bookingsStep = await Step.Run("get_my_bookings", context, async () =>
            {
                var request = HttpSteps.CreateRequest("GET", $"{options.BaseUrl}/api/bookings/mine")
                    .WithHeader("Authorization", $"Bearer {accessToken}");

                return await HttpSteps.SendAsync(httpClient, request);
            });

            return Response.Ok();
        })
        .WithLoadSimulations(SimulationPlan.Create(rate, options));
    }
}
