import '@pepperi-addons/cpi-node'
import SocketClient from '@pepperi-addons/cpi-node/build/cpi-side/socket-client'
// import https  from 'https'
// import concat from 'concat-stream'
// import vm from 'vm'
// import { IncomingMessage } from 'http'
import {pipeline} from 'stream'
import {promisify} from 'util'
import fetch from 'node-fetch'
import {createWriteStream} from 'fs'

const streamPipeline = promisify(pipeline);

// const http = require('http'), vm = require('vm')
// const SocketClient = require('@pepperi-addons/cpi-node/build/cpi-side/socket-client');

const client = new SocketClient('127.0.0.1');
client.connect().then((data: any) => {
    console.log(data);
    const parsedData = JSON.parse(data);


    fetch(parsedData.FileURL).then(response => {
        if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
        
        streamPipeline(response.body, createWriteStream('c:\\\\tmp\\cpiNodeTest.js')).then(value => {
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