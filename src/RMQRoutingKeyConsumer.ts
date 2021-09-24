import { Channel, connect, Connection, ConsumeMessage, Options } from 'amqplib'
import chalk from 'chalk'
import { Tag } from 'testapi6/dist/components/Tag'

export class RMQRoutingKeyConsumer extends Tag {
  static get des() {
    return `Consume a routing key on a exchange`
  }
  static get example() {
    return `# Read more configuration: https://www.npmjs.com/package/amqplib
- testapi6-rabbitmq.RMQRoutingKeyConsumer:
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
`
  }
  private conn: Connection
  private channel: Channel
  private resolve: any
  private reject: any

  icon = '⇇'
  connection: string
  exchanges: {
    name: string
    type: string
    exchangeOpts?: Options.AssertExchange
    targets: {
      pretty?: boolean
      prefetch?: number
      queue: string
      routingKey: string
      queueOpts?: Options.AssertQueue
      handler?: string
      consumeOpts?: Options.Consume
      autoAck?: boolean
    }[]
  }[]

  init(attrs: RMQRoutingKeyConsumer) {
    super.init(attrs)
    if (!this.exchanges) this.exchanges = []
  }

  async beforeExec() {
    this.conn = await connect(this.connection)
    this.channel = await this.conn.createChannel()
  }

  async exec() {
    this.context.once('app:stop', async () => {
      await this.stop()
    })
    return new Promise(async (resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
      try {
        if (!this.slient && this.title) {
          this.context.group(chalk.green(this.title))
        }
        await Promise.all(this.exchanges.map(async (exchange) => {
          const { name, type, exchangeOpts, targets = [] } = exchange
          await this.channel.assertExchange(name, type, exchangeOpts)
          for (const target of targets) {
            const q = await this.channel.assertQueue(target.queue, target.queueOpts)
            this.channel.bindQueue(q.queue, name, target.routingKey)
            if (target.prefetch) this.channel.prefetch(target.prefetch)
            this.context.group(chalk.green(`Consuming exchange "${name}"[${type}] with routingKey "${target.routingKey}" in queue "${target.queue}"`))
            if (target.handler) {
              if (typeof target.handler === 'string') {
                eval(`target.handler = ${target.handler}`)
              }
            }
            const handle: (msg: any) => any = target.handler as any
            await this.channel.consume(q.queue, async (msg: ConsumeMessage) => {
              msg.content = msg.content?.toString() as any
              if (!this.slient) this.context.log(chalk.gray(this.icon) + ' ' + chalk.yellow(target.pretty ? JSON.stringify(msg, null, '  ') : JSON.stringify(msg)))
              if (target.autoAck) this.channel.ack(msg)
              if (handle) {
                await handle(msg)
                if (!target.autoAck) this.channel.ack(msg)
              }
            }, target.consumeOpts)
            this.context.groupEnd()
          }
        }))
      } catch (err) {
        if (this.reject) {
          this.reject(err)
        }
      } finally {
        if (!this.slient && this.title) {
          this.context.groupEnd()
        }
      }
    })
  }

  async stop() {
    await this.channel?.close()
    await this.conn?.close()
    if (this.resolve) {
      this.resolve(undefined)
    }
  }

}
