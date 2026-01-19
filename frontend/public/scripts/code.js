// DOM element
// ------------------------------------------------------
const form = document.querySelector("form");
const msgElement = document.querySelector("input#msg");
const chatElement = document.querySelector("div#chat");


// dependencies - WebSocket
const websocket = new WebSocket("ws://localhost:8555");



// variabler, inställningar
// ------------------------------------------------------


// händelselyssnare
// ------------------------------------------------------
form.addEventListener("submit", (e) => {
    e.preventDefault();

    console.log("och nu då...");

    // skicka ett meddelande via websocket
    const msg = msgElement.value;

    const obj = {msg: msg};

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


});


// funktioner
// ------------------------------------------------------