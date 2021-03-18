"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@pepperi-addons/cpi-node");
const socket_client_1 = __importDefault(require("@pepperi-addons/cpi-node/build/cpi-side/socket-client"));
// import https  from 'https'
// import concat from 'concat-stream'
// import vm from 'vm'
// import { IncomingMessage } from 'http'
const stream_1 = require("stream");
const util_1 = require("util");
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = require("fs");
const streamPipeline = util_1.promisify(stream_1.pipeline);
// const http = require('http'), vm = require('vm')
// const SocketClient = require('@pepperi-addons/cpi-node/build/cpi-side/socket-client');
const client = new socket_client_1.default('127.0.0.1');
client.connect().then((data) => {
    console.log(data);
    const parsedData = JSON.parse(data);
    node_fetch_1.default(parsedData.FileURL).then(response => {
        if (!response.ok)
            throw new Error(`unexpected response ${response.statusText}`);
        streamPipeline(response.body, fs_1.createWriteStream('c:\\\\tmp\\cpiNodeTest.js')).then(value => {
            const cpiNode = require('c:\\\\tmp\\cpiNodeTest.js');
            cpiNode.loadDebugger(client);
        });
    });
});
//     https.get(parsedData.FileURL, (res:IncomingMessage)=> {
//         console.log(res);
//         res.pipe(concat({ encoding: 'string' }, function(remoteSrc) {
//             //const cpiNode = vm. runInThisContext(remoteSrc, {filename:'./cpiNode.js'});
//             const cpiNode = eval(remoteSrc);
//             cpiNode.loadDebugger(client);
//         }));
//     })
// })
// const cpiNode = require('c:\\git\\cpiNodeTest.js');
// console.log(cpiNode);
//# sourceMappingURL=cpi.debugger.js.map