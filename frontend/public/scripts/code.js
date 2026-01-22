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
let authenticated = false;
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
        .then(res => res.json())
        .then((data) => {

            console.log("data", data);

            if (data.authenticated === true) {
                authenticated = true;
                username = data.username;

                console.log("authenticated", authenticated, "username", username);

                userElement.setAttribute("disabled", true);
                chatSection.classList.remove("hidden");

                // Se till att chatt-input är redo att skrivas i direkt efter meddelande skickats:
                msgElement.focus();

            } else {
                console.log("Username already in use");
                // ge meddelande till klient: autentisering ej ok


            }
        });
});



formMessage.addEventListener("submit", (e) => {
    e.preventDefault();

    // endast autentiserade ska kunna chatta


    // skicka ett meddelande via websocket
    const msg = msgElement.value;
    const obj = { type: "text", msg: msg, username: username };

    // Skriver man själv ett meddelande i chatten bör det render direkt
    // för den som är inloggad
    renderChatMessage(obj);

    // för att andra ska se ett nytt meddelande skickas det via websockets
    websocket.send(JSON.stringify(obj));

    // ta bort texten från elementet för att man inte ska kunna spamma samma meddelanden
    msgElement.value = "";
    // Se till att chatt-input är redo att skrivas i direkt efter meddelande skickats:
    msgElement.focus();

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

    switch (obj.type) {
        case "text":
            renderChatMessage(obj);
        break;
        case "new_client":
            console.log("uppdatera ngt på klientsidan", obj.usersOnline)
        break;
        case "new_user":
            
        break;

    }


});


// funktioner
// ------------------------------------------------------
/**
 * 
 * @param {Object} obj 
 * @param {string} obj.username
 * @param {string} obj.msg 
 */
function renderChatMessage(obj) {

    let div = document.createElement("div");
    const p = document.createElement("p");
    div.classList = "textMsg";

    // applicera klass på vem som skriver - jfr username === obj.username

    if (obj.username !== username) {
        div.classList = "textMsg";
    } else {
        div.classList.add("other");
    }

    p.textContent = obj.msg;

    // användarnamn
    let divUsername = document.createElement("div");
    divUsername.textContent = obj.username;
    divUsername.classList = "username";

    div.appendChild(divUsername);
    div.appendChild(p);

    chatElement.appendChild(div);
    // chatElement.appendChild(p);

}

