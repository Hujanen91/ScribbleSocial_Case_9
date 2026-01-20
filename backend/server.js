// dependencies
// ------------------------------------------------------
// en minimal express server applikation
// http är en inbyggd dependencie, det behöver alltså inte installeras innan vi importerar 
import express from 'express';
import http from 'http';
import {WebSocketServer} from 'ws';




// miljövariabler / inställningar
// ------------------------------------------------------
const app = express();

// enge en mapp som express kan använda för att skicka filer automatiskt utan routes
app.use(express.static('frontend/public'))

// definera/ange våran port
const port = 8555;

// skapa en http server, express skickas med som en instans
const server = http.createServer(app);

// skapa en websocket server
const wss = new WebSocketServer({noServer: true});

// handskaningen - godkänn kommunikation via websocket
server.on("upgrade", (req, socket, head) => {
    
    console.log("event upgrade...")

    // bestäm vem som får kommunicera med websocket
    // ex, kolla om man är inloggad
    // if (!authenticated) return

    wss.handleUpgrade(req, socket, head, (ws) => {
        
        console.log("Client:", req.headers['user-agent']);

        // kommunikation on, skicka vidare event med 'emit'
        // använd händelselyssnare senare i koden
        wss.emit("connection", ws, req);
    });
});

// middleware
// ------------------------------------------------------


// routes
// ------------------------------------------------------


// lyssna på event
// ------------------------------------------------------
wss.on('connection', (ws) => {
    
    // info om klienter som autentiseras - websocket kommunikation ok
    console.log(`Klient ansluten, antal klienter: ${wss.clients.size}`);

    // skicka meddelande till browser-land
    // skicka och ta emot data, förusätt att det är i JSON-format

    const obj = {msg: "Ny klient ansluten :)"};

    ws.send(JSON.stringify(obj));

    // lyssna på event när en klient lämnar kommunikationen
    ws.on('close', () => {

        console.log(`Klient lämnade, antal klienter kvar: ${wss.clients.size}`);
    });

    // lyssna på event av sorten "message"
    ws.on('message', (data) => {

        const obj = JSON.parse(data);

        console.log(obj);

        wss.clients.forEach(client => {
            client.send(JSON.stringify(obj))
        })

    })

});


// starta servern
// ------------------------------------------------------
server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
