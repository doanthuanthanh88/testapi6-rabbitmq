import { Channel, connect, Connection, Options } from 'amqplib'
import chalk from 'chalk'
import { Tag } from 'testapi6/dist/components/Tag'

export class RMQRoutingKeyPublisher extends Tag {
  static get des() {
    return `Publish a message to a routing key on a exchange`
  }
  static get example() {
    return `# Read more configuration: https://www.npmjs.com/package/amqplib
- testapi6-rabbitmq.RMQRoutingKeyPublisher:
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
`
  }
  private conn: Connection
  private channel: Channel
  icon = '⇉'

  connection: string
  exchanges: {
    name: string
    type: string
    exchangeOpts?: Options.AssertExchange
    targets: {
      routingKey: string
      data: any,
      publishOpts?: Options.Publish
    }[]
  }[]

  init(attrs: RMQRoutingKeyPublisher) {
    super.init(attrs)
    if (!this.exchanges) this.exchanges = []
  }

  async beforeExec() {
    this.conn = await connect(this.connection)
    this.channel = await this.conn.createChannel()
  }

  async exec() {
    try {
      if (!this.slient && this.title) {
        this.context.group(chalk.green(this.title))
      }
      await Promise.all(this.exchanges.map(async (exchange) => {
        const { name, type, exchangeOpts, targets = [] } = exchange
        await this.channel.assertExchange(name, type, exchangeOpts)
        for (const target of targets) {
          const data = (target.data === null || target.data === undefined) ? '' : typeof target.data === 'object' ? JSON.stringify(target.data) : target.data.toString()
          try {
            const isOk = this.channel.publish(name, target.routingKey, Buffer.from(data), target.publishOpts)
            const msg = `Publish data to exchange "${name}"[${type}] with routingKey "${target.routingKey}"`
            if (!isOk) throw new Error(msg)
            if (!this.slient) {
              this.context.group(chalk.gray(this.icon) + ' ' + chalk.green(msg))
              this.context.log(chalk.yellow(data))
              this.context.groupEnd()
            }
          } catch (err) {
            this.context.log(chalk.red(err.message), data)
          }
        }
      }))
      if (!this.slient && this.title) {
        this.context.groupEnd()
      }
    } finally {
      await this.stop()
    }
  }

  async stop() {
    await this.channel?.close()
    await this.conn?.close()
  }
}

