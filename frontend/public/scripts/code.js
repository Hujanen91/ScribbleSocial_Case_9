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

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) { return };
    if (!player) { return };

    const rect = canvas.getBoundingClientRect();
    const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    player.draw(canvas, ctx, point);

    // buffra kordinater (points) och skicka klumpvis med ws
    points.push(point);
});

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

    // sänd buffrade koordinater via websocket
    websocket.send(JSON.stringify(drawingData));

    // ta bort alla tidigare koordinater
    points = [];
})




// funktioner
// ------------------------------------------------------
/**
 * 
 * @param {Object} obj 
 * @param {string} obj.username
 * @param {string} obj.msg
 * @param {Date} obj.date - Date 
 */

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

    // aktuell tid
    const time = document.createElement("time");

    // vad har obj.date för datatyp
    // console.log("Datatyp:", typeof obj.date);

    // datumobjekt för att kunna välja ut en viss del
    const date = new Date(obj.date);

    // visa tid som hh:mm:ss
    time.textContent = date.toLocaleTimeString();
    time.dateTime = date.toLocaleTimeString();
    div.appendChild(time);

    chatElement.prepend(div);
    chatElement.scrollTop = 0;
}


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

function refreshPage() {
    window.location.reload();
}