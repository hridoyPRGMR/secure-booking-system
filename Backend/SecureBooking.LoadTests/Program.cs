using NBomber.CSharp;
using SecureBooking.LoadTests;
using SecureBooking.LoadTests.Scenarios;

var options = LoadTestOptions.FromEnvironment();

Console.WriteLine($"Target:   {options.BaseUrl}");
Console.WriteLine($"Rate:     {options.RatePerSecond} req/s total");
Console.WriteLine($"Ramp up:  {options.RampUpSeconds}s | Duration: {options.DurationSeconds}s");

var share = Math.Max(1, options.RatePerSecond / 6);

NBomberRunner
    .RegisterScenarios(
        PublicCatalogScenarios.HotelsList(options, share * 2),
        PublicCatalogScenarios.HotelDetailsFlow(options, share),
        PublicCatalogScenarios.RoomsAvailabilitySearch(options, share),
        PublicCatalogScenarios.LocationsSearch(options, Math.Max(1, share / 2)),
        AuthScenarios.Login(options, Math.Max(1, share / 4)),
        AuthScenarios.BookingsMineFlow(options, Math.Max(1, share / 4))
        )
    .WithReportFolder("load-test-reports")
    .Run();
