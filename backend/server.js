// dependencies
// ------------------------------------------------------
// en minimal express server applikation
// http är en inbyggd dependencie, det behöver alltså inte installeras innan vi importerar 
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
// ------------------------------------------------------
// en korrigering för path, ett robust sätt att se till att våran server.js använder en 
// absolut sökväg. Vi meddelar node exakt vart filerna finns oavsett vart vi startar servern från
import path from 'path';
import { fileURLToPath } from 'url';


// hämta url från den aktuella filen (server.js)
const __filename = fileURLToPath(import.meta.url);
// extrahera dir-name från url-en vi precis hämtade ovan
const __dirname = path.dirname(__filename);

// miljövariabler / inställningar
// ------------------------------------------------------
const app = express();

// enge en mapp som express kan använda för att skicka filer automatiskt utan routes
// app.use(express.static('../frontend/public'))
// kombinera "join" hämtning och extrahering av url och dir-name:
app.use(express.static(path.join(__dirname, '../frontend/public')));

// definera/ange våran port
const port = 8555;

// skapa en http server, express skickas med som en instans
const server = http.createServer(app);

// skapa en websocket server
const wss = new WebSocketServer({ noServer: true });

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


let users = ["Knatte", "Fnatte", "Tjatte"];


// array för aktiva användarnamnet
let usersOnline = [];


// middleware
// ------------------------------------------------------
app.use(express.json());



// routes
// ------------------------------------------------------
app.post('/login', (req, res) => {
    console.log("A post request...", req.body);

    let username = req.body.username;
    console.log("username", username);

    if (users.includes(username)) {
        console.log("User is available");

        // se till att aktuellt username tas bort från users
        // ev kolla så att ett namn matchar även om man ex glömmer inledande versal

        users = users.filter((u) => u != username);

        console.log("Users left:", users);

        // skicka ett objekt:
        res.send({ authenticated: true, username: username });

        usersOnline.push(username);

    } else {
        res.send({ authenticated: false });
    }

});


// lyssna på event
// ------------------------------------------------------
wss.on('connection', (ws) => {

    // info om klienter som autentiseras - websocket kommunikation ok
    console.log(`New user connected, users online: ${wss.clients.size}`);

    // skicka meddelande till browser-land
    // skicka och ta emot data, förusätt att det är i JSON-format

    // skicka meddelande till samtliga klienter om att en ny användare finns samt alla aktiva användare
    const obj = { type: "new_client", msg: "New user has connected", usersOnline: usersOnline };
    broadcast(wss, obj);

    // lyssna på event när en klient lämnar kommunikationen
    ws.on('close', () => {
        // skicka aktuell lista på aktiva användare till klienterna
        console.log(`User left, users online: ${wss.clients.size}`);

        // ev skicka info till klienter om att en klient inte längre är med...

    });


    // lyssna på event av sorten "message"
    ws.on('message', (data) => {

        const obj = JSON.parse(data);
        console.log(obj);

        // ev om behov finns, kontrollera obj.type för att avgöra hur
        // servern hanterar inkommande meddelande

        switch(obj.type) {

            case "text":
                // broadcast(wss. obj);
                broadcastExclude(wss, ws, obj);
            break;

        }
    });


});


// starta servern
// ------------------------------------------------------
server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})


// Hjälpfunktioner för att skicka websocket till alla, eller till vissa
/**
 * 
 * @param {WebSocketServer} wss 
 * @param {object} obj 
 */
function broadcast(wss, obj) {
    wss.clients.forEach(client => {
        client.send(JSON.stringify(obj))
    });
}

// funktion som skickar till alla via websocket utom aktuell klient
/**
 * 
 * @param {WebSocketServer} wss 
 * @param {WebSocket} ws 
 * @param {object} obj 
 */
function broadcastExclude(wss, ws, obj) {
    wss.clients.forEach(client => {
        if (client !== ws) {
            client.send(JSON.stringify(obj));
        }
    });
}