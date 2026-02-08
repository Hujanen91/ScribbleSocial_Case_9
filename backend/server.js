// dependencies
// ------------------------------------------------------
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';
// en korrigering för path, ett robust sätt att se till att våran server.js använder en 
// absolut sökväg. Vi meddelar node exakt vart filerna finns oavsett vart vi startar servern från
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';


// hämta url från den aktuella filen (server.js)
const __filename = fileURLToPath(import.meta.url);
// extrahera dir-name från url-en vi precis hämtade ovan
const __dirname = path.dirname(__filename);

// miljövariabler / inställningar
// ------------------------------------------------------
const app = express();

// kombinera "join" hämtning och extrahering av url och dir-name:
app.use(express.static(path.join(__dirname, '../frontend/public')));

// definera våran port och server
const port = 8555;
// Skapa en HTTP-server med Express-appen som hanterare.
const server = http.createServer(app);
// Instansera en ny ws-server(WSS)
// noServer: true hanterar uppgraderingen från HTTP till WS manuellt
const wss = new WebSocketServer({ noServer: true });

// Våran handskakning - hanterar "Upgrade"-förfrågningar från klienten
// då WS-servern inte körs på egen port lyssnar vi på HTTP-serverns
// uppgraderings-event och lämnar över kontrollen till WebSocket-protokollet
server.on("upgrade", (req, socket, head) => {
    // Här sker uppgraderingen
    wss.handleUpgrade(req, socket, head, (ws) => {
        // Här skapas en officiell anslutning och triggar "connection"-eventet
        wss.emit("connection", ws, req);
    });
});

// array för aktiva användarnamnet
let usersOnline = [];


// middleware
// ------------------------------------------------------
// Aktiverar CORS, tillåter klienter från andra domän/portar att göra anrop till servern
app.use(cors());
// Parsa inkommande data i request.bodyn så vi kommer åt den via req.body (tex vid inloggning)
// detta är alltså en middleware som göra att servern förstår JSON:
app.use(express.json());


// routes
// ------------------------------------------------------
app.post('/login', (req, res) => {
    let username = req.body.username;

    const userExists = usersOnline.find(u => u.username === username);

    if (userExists) {
        return res.send({ authenticated: false, message: "Username is already in use" });
    }
    if (username.length <= 2 || username.length >= 10) {
        return res.send({ authenticated: false, message: "Username is too short or too long" });
    }
    
    // Skapar en random färg att ge till varje ny användare
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

    // Spara som ett object i arrayen
    const newUser = { 
        username: username, 
        color: randomColor 
    };
    
    usersOnline.push(newUser);

    // Skicka tillbaka färgen så att Player-klassen på klientsidan kan använda den
    res.send({ 
        authenticated: true, 
        username: username, 
        id: nanoid(),
        color: randomColor 
    });
});


// lyssna på event
// ------------------------------------------------------
wss.on('connection', (ws) => {

    // info om klienter som autentiseras - websocket kommunikation ok
    // console.log(`New user connected, users online: ${wss.clients.size}`);
    // skicka meddelande till samtliga klienter om att en ny användare finns samt alla aktiva användare
    const obj = { type: "new_client", msg: "New user has connected", usersOnline: usersOnline };
    broadcast(wss, obj);


    ws.username

    ws.on('close', () => {
        // skicka aktuell lista på aktiva användare till klienterna
        // console.log(`User left, users online: ${wss.clients.size}`);

        // ta bort ett element från våran username array när en klient loggar ut/stänger ner
        // skicka till alla utom aktiva användaren med hjälp av "broadcastExclude", detta för
        // att slippa onödigt eko av sina egna meddelanden eller ritade linjer i canvas
        usersOnline = usersOnline.filter(u => u.username !== ws.username);
        const obj = { type: "user_left", username: ws.username, usersOnline: usersOnline };

        broadcastExclude(wss, ws, obj);

    });

    // lyssna på event av sorten "message"
    ws.on('message', (data) => {
        // Omvandlar JSON-sträng från klienten till ett läsbart JS-objekt
        const obj = JSON.parse(data);

        // Switch funkar som en sortering baserat på våran "type"
        switch (obj.type) {

            case "text":
                // Skapar tidsstämpel på servern för att kunna sätta rätt tid för alla
                const date = new Date();
                obj.date = date;
                // skicka meddelande till alla utom avsändaren
                broadcastExclude(wss, ws, obj);
                break;

            case "new_user":

                // definerar vad för data vi vill ha i våran userData, här vill vi skicka username och player.color
                const userData = {
                    username: obj.username,
                    color: obj.player.color
                }
                // Om användaren inte finns lägger vi till den i listan över aktiva användare
                if (!usersOnline.find(u => u.username === obj.username)) {
                    usersOnline.push(userData);
                }
                // Här sparar vi användarnamnet direkt på socket-anslutningen för senare bruk
                ws.username = obj.username;
                obj.usersOnline = usersOnline;

                // Skicka uppdaterad username-list till ALLA användare
                broadcast(wss, obj);
                break;

            case "draw":
                // När användaren ritar skickar vi koordinaterna vidare till alla andra utom
                // den aktiva användaren som ritar (för att undvika onödigt eko av linjer och meddelanden)
                broadcastExclude(wss, ws, obj);

                break;
        }
    });
});


// starta servern
// ------------------------------------------------------
server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`)
})


// Hjälpfunktioner för att skicka websocket till alla (inklusive dig själv)
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