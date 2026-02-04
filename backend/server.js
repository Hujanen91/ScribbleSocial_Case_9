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

const port = 8555;
const server = http.createServer(app);

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {

    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
    });
});
// array för aktiva användarnamnet
let usersOnline = [];


// middleware
// ------------------------------------------------------
app.use(cors());
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
    
    // 2. Skapa färgen här
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

    // 3. Spara som ett OBJEKT i arrayen
    const newUser = { 
        username: username, 
        color: randomColor 
    };
    
    usersOnline.push(newUser);

    // 4. Skicka tillbaka färgen så att Player-klassen på klientsidan kan använda den
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
    // const obj = { type: "new_client", msg: "New user has connected", usersOnline: usersOnline };
    broadcast(wss, obj);

    ws.username

    ws.on('close', () => {
        // skicka aktuell lista på aktiva användare till klienterna
        // console.log(`User left, users online: ${wss.clients.size}`);

        // ta bort ett element från en array
        usersOnline = usersOnline.filter(u => u.username !== ws.username);
        const obj = { type: "user_left", username: ws.username, usersOnline: usersOnline };

        broadcastExclude(wss, ws, obj);

    });

    // lyssna på event av sorten "message"
    ws.on('message', (data) => {

        const obj = JSON.parse(data);

        switch (obj.type) {

            case "text":
                const date = new Date();

                obj.date = date;

                broadcastExclude(wss, ws, obj);
                break;

            case "new_user":

                const userData = {
                    username: obj.username,
                    color: obj.player.color
                }
                if (!usersOnline.find(u => u.username === obj.username)) {
                    usersOnline.push(userData);
                }

                ws.username = obj.username;
                obj.usersOnline = usersOnline;

                broadcast(wss, obj);
                break;

            case "draw":

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