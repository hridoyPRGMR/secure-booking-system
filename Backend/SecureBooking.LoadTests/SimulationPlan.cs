using NBomber.Contracts;
using NBomber.CSharp;

namespace SecureBooking.LoadTests;

public static class SimulationPlan
{
    public static LoadSimulation[] Create(int rate, LoadTestOptions options) =>
    [
        Simulation.RampingInject(
            rate: rate,
            interval: TimeSpan.FromSeconds(1),
            during: TimeSpan.FromSeconds(options.RampUpSeconds)),
        Simulation.Inject(
            rate: rate,
            interval: TimeSpan.FromSeconds(1),
            during: TimeSpan.FromSeconds(options.DurationSeconds)),
        Simulation.RampingInject(
            rate: 0,
            interval: TimeSpan.FromSeconds(1),
            during: TimeSpan.FromSeconds(10)),
    ];
}
