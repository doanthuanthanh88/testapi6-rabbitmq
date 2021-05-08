# testapi6-rabbitmq
Execute rabbitmq pub/sub

# Features
- Exec rabbitmq pub/sub

> Read [document details](./docs/modules.md)

# How to use
### Installation
```javascript
// install via npm
npm install -g testapi6-rabbitmq

// install via yarn
yarn global add testapi6-rabbitmq
```

### Use in yaml
```yaml
- Require:
    root: yarn
    modules:
      - testapi6-rabbitmq

- RMQRoutingKeyConsumer:
    title: Test RoutingKey Consumer
    connection: amqp://user:password@localhost
    exchanges:
      - name: thanh
        type: direct
        exchangeOpts:
          durable: true
        targets:
          - queue: thanh-test-queue
            routingKey: sayHello
            prefetch: 1
            autoAck: true
            queueOpts:
            consumeOpts:
              exclusive: false

- RMQRoutingKeyPublisher:
    title: Test RoutingKey Publisher
    connection: amqp://user:password@localhost
    exchanges:
      - name: thanh
        type: direct
        exchangeOpts:
          durable: true
        targets:
          - routingKey: sayHello
            data: { to: "thanh" }
            publishOpts:

```