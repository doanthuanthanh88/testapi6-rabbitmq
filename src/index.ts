export { RMQRoutingKeyConsumer } from "./RMQRoutingKeyConsumer"
export { RMQRoutingKeyPublisher } from "./RMQRoutingKeyPublisher"

// import { Testcase } from "testapi6/dist/components/Testcase"
// import { RMQRoutingKeyConsumer } from "./RMQRoutingKeyConsumer"
// import { RMQRoutingKeyPublisher } from "./RMQRoutingKeyPublisher"

// async function main() {
//   const tc = new Testcase('.')
//   const m = new RMQRoutingKeyConsumer()
//   m.init({
//     title: 'Test consumer',
//     connection: 'amqp://user:password@localhost',
//     slient: true,
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
//           autoAck: true,
//           steps: [
//             {
//               Echo: 'Ok'
//             }
//           ]
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
//   await m.setup(tc)
//   m.prepare()
//   await m.beforeExec()
//   m.exec()
//   console.log('done')
//   setTimeout(async () => {
//     const m = new RMQRoutingKeyPublisher()
//     m.init({
//       title: 'Test publisher',
//       slient: true,
//       connection: 'amqp://user:password@localhost',
//       exchanges: [{
//         name: 'thanh',
//         type: 'direct',
//         exchangeOpts: {
//           durable: true
//         },
//         targets: [
//           {
//             routingKey: 'test',
//             data: { age: 123 }
//           },
//           {
//             routingKey: 'test1',
//             data: { age: 123666 }
//           }
//         ]
//       }]
//     } as RMQRoutingKeyPublisher)
//     await m.setup(tc)
//     m.prepare()
//     await m.beforeExec()
//     setInterval(async () => {
//       await m.exec()
//     }, 1000)
//   }, 1000)
// }

// main()