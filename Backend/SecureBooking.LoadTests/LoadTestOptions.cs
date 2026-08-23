namespace SecureBooking.LoadTests;

public sealed class LoadTestOptions
{
    public string BaseUrl { get; private init; } = "http://localhost:5212";
    public int RatePerSecond { get; private init; } = 20;
    public int DurationSeconds { get; private init; } = 60;
    public int WarmUpSeconds { get; private init; } = 10;
    public int RampUpSeconds { get; private init; } = 15;
    public string TestUserEmail { get; private init; } = "user1@example.com";
    public string TestUserPassword { get; private init; } = "Password123!";

    public static LoadTestOptions FromEnvironment()
    {
        var baseUrl = Environment.GetEnvironmentVariable("LOADTEST_BASE_URL");

        return new LoadTestOptions
        {
            BaseUrl = string.IsNullOrWhiteSpace(baseUrl)
                ? "http://localhost:5212"
                : baseUrl.TrimEnd('/'),
            RatePerSecond = ParseInt("LOADTEST_RATE", 20),
            DurationSeconds = ParseInt("LOADTEST_DURATION_SECONDS", 60),
            WarmUpSeconds = ParseInt("LOADTEST_WARMUP_SECONDS", 10),
            RampUpSeconds = ParseInt("LOADTEST_RAMPUP_SECONDS", 15),
            TestUserEmail = Get("LOADTEST_USER_EMAIL", "user1@example.com"),
            TestUserPassword = Get("LOADTEST_USER_PASSWORD", "Password123!"),
        };
    }

    private static string Get(string name, string fallback) =>
        Environment.GetEnvironmentVariable(name) is { Length: > 0 } value ? value : fallback;

    private static int ParseInt(string name, int fallback) =>
        int.TryParse(Environment.GetEnvironmentVariable(name), out var value) && value > 0
            ? value
            : fallback;
}
