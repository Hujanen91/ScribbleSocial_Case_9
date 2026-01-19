// dependencies
// ------------------------------------------------------


// en minimal express server applikation
import express from 'express';
// http är en inbyggd dependencie, det behöver alltså inte installeras innan vi importerar 
import http from 'http';
import ws from 'ws';

// miljövariabler / inställningar
// ------------------------------------------------------
const app = express();

// enge en mapp som express kan använda för att skicka filer automatiskt utan routes
app.use(express.static('frontend/public'))

// definera/ange våran port
const port = 8555;

// middleware
// ------------------------------------------------------


// routes
// ------------------------------------------------------


// lyssna på event
// ------------------------------------------------------


// starta servern
// ------------------------------------------------------
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
