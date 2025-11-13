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
        var factory = new ConnectionFactory
        {
            HostName = cfg["RABBITMQ_HOST"],
            UserName = cfg["RABBITMQ_USER"],
            Password = cfg["RABBITMQ_PASS"]
        };
        _conn = factory.CreateConnection();
        _channel = _conn.CreateModel();

        _exchange = cfg["RABBITMQ_EXCHANGE"]!;
        _queue = cfg["RABBITMQ_EMAIL_QUEUE"]!;
        _failedQueue = cfg["RABBITMQ_FAILED_QUEUE"]!;

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
            var json = Encoding.UTF8.GetString(ea.Body.ToArray());
            var msg = JsonConvert.DeserializeObject<NotificationMessage>(json, SnakeCaseJsonSettings.Settings);
            if (msg != null) await handler(msg, ea);
            else _channel.BasicAck(ea.DeliveryTag, false);
        };
        _channel.BasicConsume(_queue, false, consumer);
    }

    public void PublishToFailed(byte[] body) =>
        _channel.BasicPublish(_exchange, _failedQueue, body: body);

    public void Publish(string routingKey, byte[] body) =>
        _channel.BasicPublish(_exchange, routingKey, body: body);

    public void Ack(ulong deliveryTag, bool multiple = false) =>
        _channel.BasicAck(deliveryTag, multiple);

    public void Nack(ulong deliveryTag, bool requeue = true) =>
        _channel.BasicNack(deliveryTag, false, requeue);

    public void Dispose()
    {
        _channel?.Close();
        _conn?.Close();
    }
}