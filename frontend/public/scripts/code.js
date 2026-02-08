// DOM element
// Hämtar referenser till våra olika HTML-element så att man vidare
// kan nyttja dessa för manipulering senare i scriptet (tex lyssna på klick eller ändra texter).
// ------------------------------------------------------
const formMessage = document.querySelector("#form-message");
const formUsername = document.querySelector("#form-username");
const userElement = document.querySelector("input#username");
const chatSection = document.getElementById("chat-stage");
const chat = document.querySelector("#chat");
const usernameDiv = document.getElementById("username-div");
const msgElement = document.querySelector("input#msg");
const alertDisplay = document.querySelector("#alert-display");
const chatElement = document.querySelector("div#chat");
const descriptionElement = document.querySelector(".description-section");
const onlineUsersMainDiv = document.getElementById("online-users-main-div");
const headerTitle = document.querySelector("h1");
const divMainBox = document.querySelector(".div-main-box");
const onlineUsersElement = document.getElementById("online-users");
const canvas = document.querySelector("canvas");
const logoutBtn = document.getElementById("logout-btn");

// dependencies - WebSocket - Lokalt:
// Lokalt (Development) - Används när koden ska köras lokalt på vår egen dator (localhost)
const host = window.location.hostname;
const websocket = new WebSocket(`ws://${host}:8555`);
const endpoint = `http://${host}:8555/login`;

// dependencies - deploy public:
// Publikt (Production) - Kommenteras ut och används när koden är klar och ska pushas och
// användas publikt.
// const backendHost = "scribblesocial-case-9.onrender.com";
// const websocket = new WebSocket(`wss://${backendHost}`);
// const endpoint = `https://${backendHost}/login`;

import Player from "./Player.js";

// Globala state och Canvas-inställningar
// ------------------------------------------------------
// Vi sätter våra variabler och inställningar nedan som vi sedan kan nyttja
// längre ner i våra funktioner och eventlisteners.
// Let används för att värdena kommer ändras under programmets gång.
let player; // Kommer innehålla Player-objekt
let ctx;    // Canvas-context (ctx) för att kunna rita 2D-grafik
let username;   //Sparar username på inloggade användare 
let color;  // Sparar ritfärg
let authenticated = false;  // Ser över om en klient är authenticated eller ej
let isDrawing = false; // Ser över om man ritar eller ej på canvas med mousedown exempelvis.
let points = []; // En array för x och y koordinaterna när man ritar

// Triggar en reload för hemsidan när användaren klickar på logout-knappen
// vilket i sin tur gör att användaren "loggas ut"
const logoutButton = () => {
    location.reload();
}


// händelselyssnare
// ------------------------------------------------------
// Vi kopplar får eventlistener till vårt formulär och submit när någon skapar en användare
// Vi hindrar sidan från att ladda om med en e.preventDefault och hämtar värdet från vårat username input-element
// const options hanterar hur vi vill skicka värdet av username
// method - berättar vad vi vill göra, POST - skicka data till servern
// header - berättar vad det är för typ av data vi kommer skicka, i detta fall JSON-format.
// body - berättar att vi vill göra om våran data och vårt JavaScript-objekt till en textsträng som servern förstår
formUsername.addEventListener("submit", (e) => {

    e.preventDefault();

    username = userElement.value;

    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username })
    };

    // fetch hämtar datan vi precis skickat till servern
    // "endpoint" definerade vi längre upp och är adressen till servern
    // "options" innehåller våra inställningar att det är en POST med JSON-data
    // första .then omvandlar serverns svar från JSON-format till läsbart JavaScript-object
    // andra .then ser till att vi kommer åt den faktiska datan av vad som nu ska ske
    fetch(endpoint, options)
        .then(res => res.json())
        .then((data) => {

            // Om en klient är authenticated enligt registrerad data
            // ska en ny Player(klient) instansieras och få ett unikt id, valda username och en
            // egen färg vid registrering
            if (data.authenticated === true) {
                authenticated = true;
                username = data.username;

                player = new Player(data.id, data.username, data.color);

                // console.log("authenticated", authenticated, "username", username);

                // Nedan hanteras vad som ska visas eller döljas när en användare
                // registreras och loggar in
                userElement.setAttribute("disabled", true);
                chatSection.classList.remove("hidden");
                canvas.classList.remove("hidden");
                logoutBtn.classList.remove("hidden");
                onlineUsersMainDiv.classList.remove("hidden");
                usernameDiv.classList.add("hidden");
                headerTitle.classList.add("hidden");
                descriptionElement.classList.add("hidden");
                divMainBox.classList.remove("div-main-box");
                divMainBox.classList.add("div-main-box-logged-in");

                // Vi meddelar att vi vill visa aktiva users i ett element på vår sida:
                onlineUsersElement.textContent = data.username;

                // vi sätter en context på våran canvas,
                // att man ska rita 2d i canvas elementet
                ctx = canvas.getContext("2d");

                // Se till att chatt-input är redo att skrivas i direkt efter meddelande skickats:
                msgElement.focus();


                // meddela via websockets att en användare har autentiserats
                // skicka våran websocket och gör om det till en JSON-sträng
                const obj = { type: "new_user", username: username, player: player };
                websocket.send(JSON.stringify(obj));
            
            // Om ovan inte går genom ska användaren få en notis om att användarnamnet redan finns:
            } else {
                console.log("Username already in use");
                alertDisplay.classList.remove("hidden");
                alertDisplay.textContent = "Username already in use!";
            }
        })
});

// Eventlistener som lyssnar på att DOM:en laddar in
// När sidan laddats in ska våran picmo emoji-picker hämtas in
// en listener på klick ser till att våran emoji container syns eller blir dold.
// Nästa eventlistener lyssnar på vilken emoji som blir vald ochsätter in den
// i inputfältet för klientens meddelande och döljer vid val våran container med emojis.
// inputfältet för meddelande får sedan fokus direkt så användaren kan fortsätta skriva 
// sitt meddelande utan att klicka i inputfältet igen.
window.addEventListener('DOMContentLoaded', () => {
    const trigger = document.querySelector('#emoji-trigger');
    const container = document.querySelector('#emoji-picker-container');

    const picker = picmo.createPicker({
        rootElement: document.querySelector('#emoji-picker')
    });

    trigger.addEventListener('click', () => {
        container.classList.toggle('hidden');
    });

    picker.addEventListener('emoji:select', (selection) => {
        msgElement.value += selection.emoji;
        container.classList.add('hidden');
        msgElement.focus();
    })
})

// Eventlistener för våran submit när en användare skickar sitt meddelande
// e.preventDefault motverkar en refresh av hemsidan
// Vi skickar sedan vårat meddelande via websocket
// aktuell tid skickas även med för att visa när meddelandet skrevs 
formMessage.addEventListener("submit", (e) => {
    e.preventDefault();

    const msg = msgElement.value;
    const obj = { type: "text", msg: msg, username: username };

    const date = new Date();
    obj.date = date;

    // Skriver man själv ett meddelande i chatten rendererar det direkt
    // lokalt i vår egen chatt och
    // för att andra ska se ett nytt meddelande skickas det via websockets
    renderChatMessage(obj);
    websocket.send(JSON.stringify(obj));

    // ta bort texten från elementet för att man inte ska kunna spamma samma meddelanden
    // Se till att chatt-input får fokus och är redo att skrivas i direkt efter meddelande skickats:
    msgElement.value = "";
    msgElement.focus();
})

// Eventlistener som lyssna på klick på logout button
logoutBtn.addEventListener("click", logoutButton);

// aktivera lyssnare på socket events - "hjärnan" i realtidskommunikationen
// Lyssnaren aktiveras varje gång servern skickar data via vår WebSocket.
websocket.addEventListener("message", (e) => {

    // e.data är våran data (en sträng) som kommer från våran server
    const data = e.data;

    // vi omvandlar JSON-strängen till läsbar JavaScript-objekt
    // för att kunna läsa egenskaper så som .type eller tex .username
    const obj = JSON.parse(e.data);

    // Switch funkar som en sorteringsstation, den sorterar inkommande meddelanden
    // baserad på deras "type".
    switch (obj.type) {
        // Om typen är "text" vet vi att någon skrivit ett chattmeddelande
        // vi anropar då våran funktion som rutar ut meddelandet i HTML
        case "text":
            renderChatMessage(obj);
            break;

        // Här kan logik för en anonym besökare läggas till vid behov
        // just nu sker ingenting här dock.
        case "new_client":
            break;

        // Om ny användare loggar in eller lämnar (user_left)
        // så uppdateras listan över inloggade användare
        // vi mappar sedan genom varje user och lägger in dom i ett li element
        // som visar deras username och en rund cirkel intill deras namn med deras specifikt
        // utvalda färg, detta för att man ska kunna urskilja varje användare när dom ritar med 
        // samma färg i canvas.
        // join används sedan för att slå ihop arrayen av strängar till en enda lång textsträng
        case "new_user":
            onlineUsersElement.innerHTML = obj.usersOnline.map(user => `
                <li>
                    ${user.username}
                    <span class="online-dot" style="background-color:${user.color};"></span>
                </li>
            `).join("");
            break;

        case "user_left":
            onlineUsersElement.innerHTML = obj.usersOnline.map(user => `
                <li>
                    ${user.username}
                    <span class="online-dot" style="background-color:${user.color};"></span>
                </li>
            `).join("");
            break;
        
        // Om typen är "draw" så vet vi att någon ritar på sin canvas
        // Vi skickar sedan vidare koordinaterna till våran drawLine function så vi kan
        // få ut vad den andra användaren ritar i realtid
        case "draw":

            drawLine(obj);

            break;
    }
});


// lägg till händelselyssnare för att kunna rita i ett canvas-element
// "mousedown" lyssnar på när någon håller ner musknappen
// hämta en position relativ till klientens viewport, vi räknar alltså ut
// musens position relativ till canvasens nollpunkt (uppe i vänster hörn)
// 
// vi ser till att se över så att användaren är inloggad innan vi tillåter interaktion
// ställ in isDrawing till att va true
// vi skickar med canvas, ctx och point argumenten för att ge player-instansen direkt tillgång
// till rätt rityta och vart den ska börja.
// 
// sätt en tom array för points och pusha point till points arrayen, detta för att 
// minska på hur många hämtningar live man ska köra för att inte överbelasta servern, 
// istället skickas en array med den mängd points en klient ritade när dom väl släpper på musknappen
canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    if (!player) { return }

    isDrawing = true;

    player.drawStart(canvas, ctx, point);

    points = [];
    points.push(point);
});

// -----------------------------------------------------------------------
// En början till att göra mobil användning möjlig, inte klar än dock
// canvas.addEventListener("touchmove", (e) => {
//     e.preventDefault();
//     const rect = canvas.getBoundingClientRect();
//     const touch = e.touches[0];
//     const point = {
//         x: e.clientX - rect.left,
//         y: e.clientY - rect.top
//     };

//     if (!player) { return }

//     isDrawing = true;

//     player.drawStart(canvas, ctx, point);

//     points = [];
//     points.push(point);
// });
// -----------------------------------------------------------------------


// Vi sätter en eventlistener vid musrörelse, 
// om klienten inte ritar eller om det inte finns en klient/spelare så tillåter vi ingen interaktion
// 
// som ovan hämtar vi musens position relativ till canvasens nollpunkt med våran const rect och const point
//
// vi skickar med canvas, ctx och point för att ge player-instansen tillgång till rätt
// rityta och var den ska börja
// 
// Vi buffrar tillsist koordinater (points) och skickar dom klumpvis med ws
canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) { return };
    if (!player) { return };

    const rect = canvas.getBoundingClientRect();
    const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    player.draw(canvas, ctx, point);

    points.push(point);
});

// Sätt en evenlistener som lyssnar på när man släpper musknappen
// 
// om klienten inte är inloggad tillåter vi ingen interaktion
// vi sätter isDrawing till false vid mouseup
// 
// Vi buntar sedan ihop points och färg i ett objekt för att
// kunna skicka med datan när användaren ritar, detta för att koppla
// och få ut rätt färg till rätt användare
// 
// Vi skickar buffrade koordinater via ws
// och rensar sedan tidigare koordinater med points = [];
canvas.addEventListener("mouseup", (e) => {

    if (!player) { return }

    isDrawing = false;

    // Vi paketerar points och färg i ett objekt
    const drawingData = {
        type: "draw",
        points: points,
        color: player.color,
        username: player.username
    };

    websocket.send(JSON.stringify(drawingData));
    points = [];
})



// funktioner
// ------------------------------------------------------
/**
 * 
 * @param {Object} obj 
 * @param {string} obj.username
 * @param {string} obj.msg
 * @param {Date} obj.date
 */
// Funktion som rendererar chattmeddelanden
// skapar två element, div och p och ger diven en class "text-msg"
// om objectet username inte är lika med det aktiva username
// ska classlist vara "text-msg", annars ska "other" läggas till
// detta för att styla aktiv user annorlunga från andra inloggade klienter
// så man i chatten tydligt kan se vilka meddelanden som är ens egna
// vi sätter textContent till vårat objects msg input och sätter class "text"
// Skapar sedan en div kopplad till divUsername och sätter textContent
// till vårat objects username, aktiva användarnamnet för inloggad klient
// sedan sätter vi en class "username"
// vi skickar sedan divUsername och våran p till DOM:en så det kan visas för
// användaren.
// Vi deklarerar en variabel för time och skapar ett tomt element "time"
// Vi deklarerar sedan en variabel för date och tilldelar den värdet
// new Date och hämtar in datan date från vårat object
// Vidare sätter vi in datan från våran date i våran time variabel och 
// gör om dom till local date strings för bättre läsbarhet
// vi skickar sedan vårat element med datan till våran div med appendChild
// 
// Vi skickar sedan ut vårat element med datan till DOM:en för användning på klientsidan
// Med prepand istället för appendChild så skickar vi div-elementet så det
// lägger sig allra först i föräldraelementet, detta för att nya chattmeddelanden ska synas längst upp i chattfönstret
// för bra UX
// scrollTop tvingar webbläsaren att hoppa direkt till toppen av chatElement så den inte hoppar
// längst ner vid varje nytt meddelande.
function renderChatMessage(obj) {

    let div = document.createElement("div");
    const p = document.createElement("p");
    div.classList = "text-msg";

    if (obj.username !== username) {
        div.classList = "text-msg";
    } else {
        div.classList.add("other");
    }

    p.textContent = obj.msg;
    p.classList = "text";

    // användarnamn
    let divUsername = document.createElement("div");
    divUsername.textContent = obj.username;
    divUsername.classList = "username";

    div.appendChild(divUsername);
    div.appendChild(p);

    const time = document.createElement("time");

    // vad har obj.date för datatyp
    // console.log("Datatyp:", typeof obj.date);

    const date = new Date(obj.date);

    time.textContent = date.toLocaleTimeString();
    time.dateTime = date.toLocaleTimeString();
    div.appendChild(time);

    chatElement.prepend(div);
    chatElement.scrollTop = 0;
}

/**
 *
 *
 * @param {Object} obj
 * @param {Array} obj.points
 * @param {string} obj.color
 */
// Vi hämtar ut punkter från objektet
// Sätter en koll som ser över att minst två punkter behövs för att kunna dra ett streck
// Och en koll som ser över att vi har tillgång till ritytans context (ctx)
// Vi sätter sedan pennan/linjernas utseende
// Flyttar sedan pennan till den första startpunken
// 
// Loopar sedan genom resten av punkterna och drar osynliga linjer mellan dom.
// Vi målar sedan ut linjerna som definerats innan på våran canvas med ctx.stroke();
// Avslutar sedan ritvägen med ctx.closePatch();
function drawLine(obj) {

    const points = obj.points;

    if (!points || points.length < 2) return;
    if (!ctx) ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.strokeStyle = obj.color || "black";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);

    }
    ctx.stroke();
    ctx.closePath();
}

// Laddar om hela webbsidan, används för att logga ut användaren
function refreshPage() {
    window.location.reload();
}