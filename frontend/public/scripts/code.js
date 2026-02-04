// DOM element
// ------------------------------------------------------
const formMessage = document.querySelector("#form-message");
const formUsername = document.querySelector("#form-username");
const userElement = document.querySelector("input#username");
const chatSection = document.getElementById("chat-stage");
const chat = document.querySelector("#chat");
const usernameDiv = document.getElementById("username-div");
const msgElement = document.querySelector("input#msg");
const chatElement = document.querySelector("div#chat");
const descriptionElement = document.querySelector(".description-section");
const onlineUsersMainDiv = document.getElementById("online-users-main-div");
const headerTitle = document.querySelector("h1");
const divMainBox = document.querySelector(".div-main-box");
const onlineUsersElement = document.getElementById("online-users");
const canvas = document.querySelector("canvas");
const logoutBtn = document.getElementById("logout-btn");

// dependencies - WebSocket
// const websocket = new WebSocket("ws://localhost:8555");
const backendHost = "scribblesocial-case-9.onrender.com";
const websocket = new WebSocket(`wss://${backendHost}`);
const endpoint = `https://${backendHost}/login`;

import Player from "./Player.js";

let player;


// console.log(player);



// variabler, inställningar
// ------------------------------------------------------
let ctx;
let username;
let color;
let authenticated = false;
let isDrawing = false;
let points = [];
const logoutButton = () => {
    location.reload();
}
// const currentUsers = [];


// testa rita i canvas elementet
// ------------------------------------------------------
// beskriv en cirkelbåge
// ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2, true);

// rita
// ctx.fill();


// händelselyssnare
// ------------------------------------------------------
formUsername.addEventListener("submit", (e) => {

    e.preventDefault();

    username = userElement.value;

    // const endpoint = "http://localhost:8555/login";

    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username })
    };

    fetch(endpoint, options)
        .then(res => res.json())
        .then((data) => {

            console.log("data", data);

            if (data.authenticated === true) {
                authenticated = true;
                username = data.username;

                // instansiera en ny "player"
                player = new Player(data.id, data.username, data.color);

                console.log("authenticated", authenticated, "username", username);

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

                // resizeCanvas();

                onlineUsersElement.textContent = data.username;
                // rita 2d i canvas elementet
                ctx = canvas.getContext("2d");


                // Se till att chatt-input är redo att skrivas i direkt efter meddelande skickats:
                msgElement.focus();

                // meddela via websockets att en användare har autentiserats
                const obj = { type: "new_user", username: username, player: player };
                websocket.send(JSON.stringify(obj));

                // const userData = {
                //     username: data.username,
                //     id: data.id
                // };

                // sessionStorage.setItem("chatUser", JSON.stringify(userData));

            } else {
                console.log("Username already in use");
                // ge meddelande till klient: autentisering ej ok
            }
        })
});

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


formMessage.addEventListener("submit", (e) => {
    e.preventDefault();

    // endast autentiserade ska kunna chatta


    // skicka ett meddelande via websocket
    const msg = msgElement.value;
    const obj = { type: "text", msg: msg, username: username };

    // aktuell tid
    const date = new Date();
    obj.date = date;

    // Skriver man själv ett meddelande i chatten bör det render direkt
    // för den som är inloggad
    renderChatMessage(obj);

    chat.classList.remove("hidden");

    // för att andra ska se ett nytt meddelande skickas det via websockets
    websocket.send(JSON.stringify(obj));

    // ta bort texten från elementet för att man inte ska kunna spamma samma meddelanden
    msgElement.value = "";
    // Se till att chatt-input är redo att skrivas i direkt efter meddelande skickats:
    msgElement.focus();

})

logoutBtn.addEventListener("click", logoutButton);

// aktivera lyssnare på socket events
websocket.addEventListener("message", (e) => {

    const data = e.data;
    // skicka och ta emot data, förusätt att det är i JSON-format

    const obj = JSON.parse(e.data);
    console.log("obj", obj);

    switch (obj.type) {

        case "text":
            renderChatMessage(obj);
            break;

        case "new_client":
            // console.log("uppdatera ngt på klientsidan", obj.usersOnline)
            break;

        case "new_user":
            // visa en uppdaterad lista på aktuella användare som servern anser vara online
            console.log("Users:", obj.usersOnline)
            onlineUsersElement.innerHTML = obj.usersOnline.map(user => `
                <li>
                    ${user.username}
                    <span class="online-dot" style="background-color:${user.color};"></span>
                </li>
            `).join("");
            break;

        case "user_left":
            onlineUsersElement.textContent = obj.usersOnline;
            break;

        case "draw":

            // anropa en funktion
            drawLine(obj);

            break;
    }


});


// window.addEventListener("load", resizeCanvas);
// window.addEventListener("resize", resizeCanvas);

// lägg till händelselyssnare för att kunna rita i ett canvas-element
canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    if (!player) { return }

    // const point = { x: e.offsetX, y: e.offsetY };
    // console.log("mousedown");
    isDrawing = true;

    player.drawStart(canvas, ctx, point);

    // ctx.beginPath();
    // ctx.moveTo(point.x, point.y);
    points = [];
    // buffra koordinat (point)
    points.push(point);
});

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    if (!player) { return }

    // const point = { x: e.offsetX, y: e.offsetY };
    // console.log("mousedown");
    isDrawing = true;

    player.drawStart(canvas, ctx, point);

    // ctx.beginPath();
    // ctx.moveTo(point.x, point.y);
    points = [];
    // buffra koordinat (point)
    points.push(point);
});

canvas.addEventListener("mousemove", (e) => {
    // const point = { x: e.offsetX, y: e.offsetY };
    // console.log(point);
    if (!isDrawing) { return };
    if (!player) { return };

    const rect = canvas.getBoundingClientRect();
    const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    player.draw(canvas, ctx, point);
    // ctx.lineTo(point.x, point.y);
    // ctx.stroke();

    // buffra kordinater (points) och skicka klumpvis med ws
    points.push(point);
});

canvas.addEventListener("mouseup", (e) => {
    // const points = { x: e.offsetX, y: e.offsetY };
    // console.log("mouseup");
    if (!player) { return }

    isDrawing = false;

    // HÄR SKER MAGIN: Vi paketerar points OCH färg i ett objekt
    const drawingData = {
        type: "draw",
        points: points,       // Arrayen med alla punkter från mousedown till mouseup
        color: player.color,  // Ser till att obj.color inte blir undefined på servern
        username: player.username // Valfritt: bra för att veta vem som ritat
    };
    // player.drawEnd(canvas, ctx);
    // ctx.closePath();

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

    // applicera klass på vem som skriver - jfr username === obj.username

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

    // vad har obj.date för datatyo
    console.log("Datatyp:", typeof obj.date);

    // datumobjekt för att kunna välja ut en viss del
    const date = new Date(obj.date);

    // visa tid som hh:mm:ss
    time.textContent = date.toLocaleTimeString();
    time.dateTime = date.toLocaleTimeString();
    div.appendChild(time);


    chatElement.prepend(div);
    // chatElement.appendChild(p);
    chatElement.scrollTop = 0;
}

// function resizeCanvas() {
//     canvas.width = canvas.clientWidth;
//     canvas.height = canvas.clientHeight;

//     ctx = canvas.getContext("2d");
// }

// resizeCanvas();

function drawLine(obj) {

    const points = obj.points;

    if (!points || points.length < 2) return;
    console.log("Ritar linje med färg:", obj.color, "Första punkt:", points[0]);
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

    ctx.fillText(obj.username, points[0].x, points[0].y);
    // ctx.font = "14px";
    // ctx_wrap.fillStyle(obj.color);
}

function refreshPage() {
    window.location.reload();
}