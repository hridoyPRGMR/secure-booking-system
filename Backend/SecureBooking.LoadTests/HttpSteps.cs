using NBomber.Contracts;
using NBomber.CSharp;
using NBomber.Http;
using NBomber.Http.CSharp;

namespace SecureBooking.LoadTests;

public static class HttpSteps
{
    public static HttpRequestMessage CreateRequest(string method, string url) =>
        Http.CreateRequest(method, url).WithHeader("Accept", "application/json");

    public static Task<Response<HttpResponseMessage>> SendAsync(HttpClient httpClient, HttpRequestMessage request) =>
        Http.Send(httpClient, request);
}
