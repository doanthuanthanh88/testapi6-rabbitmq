export { RMQRoutingKeyConsumer } from "./RMQRoutingKeyConsumer"
export { RMQRoutingKeyPublisher } from "./RMQRoutingKeyPublisher"

// import { RMQRoutingKeyConsumer } from "./RoutingKey"

// async function main() {
//   // setTimeout(async () => {
//   const m = new RMQRoutingKeyConsumer({
//     title: 'Test consumer',
//     connection: 'amqp://user:password@localhost',
//     exchanges: [{
//       name: 'thanh',
//       type: 'direct',
//       exchangeOpts: {
//         durable: true
//       },
//       targets: [
//         {
//           queue: 'thanh-test-queue',
//           routingKey: 'test',
//           consumeOpts: {
//             exclusive: false
//           },
//           autoAck: true
//         }, {
//           queue: 'thanh-test1-queue',
//           routingKey: 'test1',
//           consumeOpts: {
//             exclusive: false
//           },
//           autoAck: true
//         }
//       ]
//     }]
//   } as RMQRoutingKeyConsumer)
//   m.prepare()
//   await m.beforeExec()
//   await m.exec()
//   console.log('done')
//   // })
//   // const m = new RMQRoutingKeyPublisher({
//   //   title: 'Test publisher',
//   //   connection: 'amqp://user:password@localhost',
//   //   exchanges: [{
//   //     name: 'thanh',
//   //     type: 'direct',
//   //     exchangeOpts: {
//   //       durable: true
//   //     },
//   //     targets: [
//   //       {
//   //         routingKey: 'test',
//   //         data: { age: 123 }
//   //       },
//   //       {
//   //         routingKey: 'test1',
//   //         data: { age: 123666 }
//   //       }
//   //     ]
//   //   }]
//   // } as RMQRoutingKeyPublisher)
//   // m.prepare()
//   // await m.beforeExec()
//   // await m.exec()
// }

// main()