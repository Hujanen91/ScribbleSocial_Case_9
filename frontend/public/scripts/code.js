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
})

// aktivera lyssnare på input#msg: kan användas för att visa att ngn skriver tex "...is typing"
msgElement.addEventListener("keydown", (e) => {
    console.log("is typing", e.key);

    // ...hanter att en person skriver ngt - kan kanske skickas som en händelse backend...
});



// funktioner
// ------------------------------------------------------