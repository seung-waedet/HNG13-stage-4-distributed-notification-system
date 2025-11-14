using System.Text;
using EmailService.Models;
using EmailService.Utils;
using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace EmailService.Services;

public class RabbitMqSubscriber : IDisposable
{
    private readonly IConnection _conn;
    private readonly IModel _channel;
    private readonly ILogger<RabbitMqSubscriber> _log;
    private readonly IConfiguration _cfg;
    private readonly string _exchange, _queue, _failedQueue;

    public RabbitMqSubscriber(IConfiguration cfg, ILogger<RabbitMqSubscriber> log)
    {
        _cfg = cfg;
        _log = log;
        var host = cfg["RABBITMQ_HOST"];
        log.LogInformation("Connecting to RabbitMQ host {Host}", host);
        var factory = new ConnectionFactory
        {
            ClientProvidedName = "Email Service",
            HostName = host,
            UserName = cfg["RABBITMQ_USER"],
            Password = cfg["RABBITMQ_PASS"],
            DispatchConsumersAsync = true,
            RequestedHeartbeat = TimeSpan.FromSeconds(30)
        };
        _conn = factory.CreateConnection();
        _channel = _conn.CreateModel();
        log.LogInformation("Successfully connected to RabbitMQ");

        _exchange = cfg["RABBITMQ_EXCHANGE"]!;
        _queue = cfg["RABBITMQ_EMAIL_QUEUE"]!;
        _failedQueue = cfg["RABBITMQ_FAILED_QUEUE"]!;

        log.LogInformation("Declaring exchange '{Exchange}' and queues '{Queue}', '{FailedQueue}'", _exchange, _queue, _failedQueue);
        _channel.ExchangeDeclare(_exchange, "direct", durable: true);
        _channel.QueueDeclare(_queue, durable: true, exclusive: false, autoDelete: false);
        _channel.QueueDeclare(_failedQueue, durable: true, exclusive: false, autoDelete: false);
        _channel.QueueBind(_queue, _exchange, "email");
    }

    public void StartConsuming(Func<NotificationMessage, BasicDeliverEventArgs, Task> handler)
    {
        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.Received += async (s, ea) =>
        {
            _log.LogInformation("Received message with delivery tag {DeliveryTag}", ea.DeliveryTag);
            var json = Encoding.UTF8.GetString(ea.Body.ToArray());
            var msg = JsonConvert.DeserializeObject<NotificationMessage>(json, SnakeCaseJsonSettings.Settings);
            if (msg != null)
            {
                await handler(msg, ea);
            }
            else
            {
                _log.LogWarning("Could not deserialize message with delivery tag {DeliveryTag}. Acknowledging to discard.", ea.DeliveryTag);
                _channel.BasicAck(ea.DeliveryTag, false);
            }
        };
        _channel.BasicConsume(_queue, false, consumer);
        _log.LogInformation("Consumer started on queue '{Queue}'", _queue);
    }

    public void PublishToFailed(byte[] body)
    {
        _log.LogInformation("Publishing message to failed queue '{FailedQueue}'", _failedQueue);
        _channel.BasicPublish(_exchange, _failedQueue, body: body);
    }

    public void Publish(string routingKey, byte[] body)
    {
        _log.LogInformation("Republishing message with routing key '{RoutingKey}' to exchange '{Exchange}'", routingKey, _exchange);
        _channel.BasicPublish(_exchange, routingKey, body: body);
    }

    public void Ack(ulong deliveryTag, bool multiple = false)
    {
        _log.LogInformation("Acknowledging message with delivery tag {DeliveryTag}", deliveryTag);
        _channel.BasicAck(deliveryTag, multiple);
    }

    public void Nack(ulong deliveryTag, bool requeue = true)
    {
        _log.LogWarning("Nacking message with delivery tag {DeliveryTag}", deliveryTag);
        _channel.BasicNack(deliveryTag, false, requeue);
    }

    public void Dispose()
    {
        _channel?.Close();
        _conn?.Close();
    }
}