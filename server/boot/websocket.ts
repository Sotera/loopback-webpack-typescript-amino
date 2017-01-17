import kernel from '../inversify.config';
import {IPostal} from 'firmament-yargs';
import nodeUrl = require('url');
const findPort = require('find-free-port');
const webSocket = require('nodejs-websocket');
let webSocketPort: number;

module.exports = function (server) {
  findPort(7001, 8000, (err, port) => {
    if (err) {
      return;
    }
    //Serve up websocket
    webSocket.createServer(conn => {
      conn.on('text', text => {
        conn.sendText(JSON.stringify({
          channel: 'WebSocketTest',
          topic: 'TestTopic',
          data: {name: 'Tropic of', rank: 'Cancer'}
        }));
        /*        setInterval(() => {
         try {
         } catch (err) {
         }
         }, 1000);*/
      });
      conn.on('close', (code, reason) => {
        console.log('closed');
      });
    }).listen(webSocketPort = port);
    //Give client a way to get websocket port
    server.get('/util/get-websocket-port', function (req, res) {
      let url = nodeUrl.parse(`http://${req.headers.host}`);
      return res.status(200).send({
        hostname: url.hostname,
        port: webSocketPort,
        uri: `ws://${url.hostname}:${webSocketPort}`
      });
    });
    //Set up websocket comm bus
    let postal: IPostal = kernel.get<IPostal>('IPostal');
    postal.subscribe({
      channel: 'WebSocket',
      topic: 'Test',
      callback: (data, envelope) => {
        let a = 3;
      }
    });
  });
};
