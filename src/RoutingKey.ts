import { Channel, connect, Connection, ConsumeMessage, Options } from 'amqplib'
import chalk from 'chalk'
import { Tag } from 'testapi6/dist/components/Tag'

export class RMQRoutingKeyPublisher extends Tag {
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

  constructor(attrs: RMQRoutingKeyPublisher) {
    super(attrs)
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
  }

  async stop() {
    await this.channel?.close()
    await this.conn?.close()
  }
}

export class RMQRoutingKeyConsumer extends Tag {
  private conn: Connection
  private channel: Channel

  icon = '⇇'
  connection: string
  exchanges: {
    name: string
    type: string
    exchangeOpts?: Options.AssertExchange
    targets: {
      prefetch?: number
      queue: string
      routingKey: string
      queueOpts?: Options.AssertQueue
      handler?: string
      consumeOpts?: Options.Consume
      autoAck?: boolean
    }[]
  }[]

  constructor(attrs: RMQRoutingKeyConsumer) {
    super(attrs)
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
        const handle = target.handler as any
        await this.channel.consume(q.queue, async (msg: ConsumeMessage) => {
          msg.content = msg.content?.toString() as any
          if (!this.slient) this.context.log(chalk.gray(this.icon) + ' ' + chalk.yellow(JSON.stringify(msg)))
          if (target.autoAck) this.channel.ack(msg)
          if (handle) {
            await handle(msg)
            if (!target.autoAck) this.channel.ack(msg)
          }
        }, target.consumeOpts)
        this.context.groupEnd()
      }
    }))
    if (!this.slient && this.title) {
      this.context.groupEnd()
    }
  }

  async stop() {
    await this.channel?.close()
    await this.conn?.close()
  }

}
