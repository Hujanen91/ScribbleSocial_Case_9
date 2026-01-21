// DOM element
// ------------------------------------------------------
const formMessage = document.querySelector("#formMessage");
const formUsername = document.querySelector("#formUsername");
const userElement = document.querySelector("input#username");
const chatSection = document.getElementById("chatStage");
const msgElement = document.querySelector("input#msg");
const chatElement = document.querySelector("div#chat");
const listDisplay = document.getElementById("userList");
const alertDisplay = document.getElementById("alertDisplay");


// dependencies - WebSocket
const websocket = new WebSocket("ws://localhost:8555");


// variabler, inställningar
// ------------------------------------------------------

let username;
// const currentUsers = [];

// händelselyssnare
// ------------------------------------------------------
formUsername.addEventListener("submit", (e) => {

    e.preventDefault();

    username = userElement.value;

    const endpoint = "http://localhost:8555/login";

    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username })
    };

    fetch(endpoint, options)
        .then(res => res.text())
        .then((data) => {

            console.log("data", data);
            userElement.setAttribute("disabled", true);
            chatSection.classList.remove("hidden");
        })




})



formMessage.addEventListener("submit", (e) => {
    e.preventDefault();

    console.log("och nu då...");

    // skicka ett meddelande via websocket
    const msg = msgElement.value;
    const obj = { msg: msg, username: username };

    // Skriver man själv ett meddelande i chatten bör det render direkt
    // för den som är inloggad
    renderChatMessage(obj);

    // för att andra ska se ett nytt meddelande skickas det via websockets
    websocket.send(JSON.stringify(obj));

})

// aktivera lyssnare på input#msg: kan användas för att visa att ngn skriver tex "...is typing"
msgElement.addEventListener("keydown", (e) => {
    console.log("is typing", e.key);

    // ...hanter att en person skriver ngt - kan kanske skickas som en händelse backend...
});

// aktivera lyssnare på socket events
websocket.addEventListener("message", (e) => {

    const data = e.data;

    // skicka och ta emot data, förusätt att det är i JSON-format

    const obj = JSON.parse(e.data);
    console.log("obj", obj);

    renderChatMessage(obj);

});


// funktioner
// ------------------------------------------------------


function renderChatMessage(obj) {

    const p = document.createElement("p");
    p.textContent = obj.msg;
    chatElement.appendChild(p);

    // applicera klass på vem som skriver - jfr username === obj.username






}

