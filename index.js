const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const WebSocket = require('ws');

const routes = require('./routes/routes');
const executeCode = require('./controller/CodeExecution');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = new Map();
wss.on('connection', (ws) => {

    console.log('client connected');

    ws.on('message', (message) => {

        const data = JSON.parse(message);

        if(data.type === 'registration'){

            clients.set(ws, data.roomId);
        }
        else if (data.type === 'submitCode') {

            const rId = data.roomId;

            executeCode(data.code, data.lang)
            .then(res=>{

                // console.log('ouput in index', res);
                // ws.send(JSON.stringify({ type: 'output', result:  res}));

                clients.forEach((value, key)=>{

                    if(key.readyState === WebSocket.OPEN && value === rId){
    
                        key.send(JSON.stringify({ type: 'output', result:  res }));
                    }
                });
            })
            .catch(err=>{
                console.log('error ouput in index', err);
                ws.send(JSON.stringify({ type: 'output', result:  err}));
            })  
        }
        // Broadcast the change to all room clients
        else if (data.type === 'edit') {
           
            const rId = data.roomId;
            
            clients.forEach((value, key)=>{
                if(key !== ws && key.readyState === WebSocket.OPEN && value === rId){

                    console.log('Sending msgs', data.changedCode);
                    key.send(JSON.stringify({ type: 'edit', code: data.changedCode }));
                }
            });
        }
    });

    ws.on('close', () => {

        clients.delete(ws);
        console.log('Client disconnected');
    })
});

app.use(routes);

app.use((err, req, res, next) => {
    console.log(err);
    res.send('Hmm Something Went Wrong!!');
});

server.listen(3000, (err) => {                            // listening on server and not app because websocket is defined on server
    if (err) {                                            // and app.listen returns new instance of server.Thus websocket will not 
        console.log(err);                                 // work on app.listen().
    }
    else {
        console.log('Connected and listening...');
    }
});