using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace EmailService.Utils;

public static class SnakeCaseJsonSettings
{
    public static readonly JsonSerializerSettings Settings = new()
    {
        ContractResolver = new DefaultContractResolver
        {
            NamingStrategy = new SnakeCaseNamingStrategy()
        },
        NullValueHandling = NullValueHandling.Ignore
    };
}