# ScribbleSocial
<a name="top"></a>
<a name="om-projektet"></a>
## Om projektet

Case 9 Websocket Canvas

En plattform för gruppchatt med en anslagstavla där användarna kan rita medans dom pratar.

Hemsidan finns publicerad på Netlify: <br>
[ScribbleSocial](https://scribblesocial.netlify.app/) 

## Innehållsförteckning
* [Om projektet](#om-projektet)
* [Tekniker](#tekniker)
* [Installation](#installation)
* [Användning](#användning)
* [Mockup](#mockup)
* [Screenshots](#screenshots)
* [AI-Användning](#ai-användning)

---


<a name="tekniker"></a>
## Teknisk Stack & Verktyg
* <b>Backend:</b> Node.js, Express, ws (WebSockets)
* <b>Frontend:</b> HTML5, Canvas, Vanilla JavaScript
* <b>Pakethantering:</b> npm
* <b>Utveckling:</b> nodemon (för att slippa starta om servern manuellt)

<a name="installation"></a>
## Installation
Steg-för-steg instruktioner om hur du får igång projektet lokalt:

### 1. Installera Node.js
Du behöver ha Node.js installerat. För att se om du redan har det, öppna din terminal och skriv:
```bash
node -v
```
Får du inte fram ett versionsnummer behöver du gå till [nodejs.org](https://nodejs.org/en) och installera det.

## 2. Klona projektet
[https://github.com/Hujanen91/ScribbleSocial_Case_9.git](https://github.com/Hujanen91/ScribbleSocial_Case_9.git)
```
git clone https://github.com/Hujanen91/ScribbleSocial_Case_9.git
```

## 3. Gå in i mappen

```
cd ScribbleSocial_Case_9
```

## 4. Installera dependencies
```
npm install
```
## 5. Konfigurera anslutning
Öppna code.js och kontrollera att anslutningen är inställd för lokal utveckling:
Se till att kommentera in koden för Lokal utveckling från rad 24 till rad 26 i code.js:

```
const host = window.location.hostname;
const websocket = new WebSocket(`ws://${host}:8555`);
const endpoint = `http://${host}:8555/login`;
```

``Variabeln host ska använda window.location.hostname.`` <br>
``Porten ska vara 8555.``


## 6. Startar servern med automatisk omstart vid ändringar (rekommenderas)
```
npm run dev
```

## 5. Testa appen
Öppna webbläsaren på: http://localhost:8555

Välj ett användarnamn och logga in.

Öppna ett extra fönster (eller inkognitoläge) för att se hur chatten och ritandet syns hos båda samtidigt!

<a name="användning"></a>
Appen är designad för att vara enkel och interaktiv. Här är flödet:

* <b>Logga in:</b> När du startar appen möts du av en inloggningssida. Skriv in ditt önskade användarnamn. Systemet kontrollerar via ett API-anrop (POST /login) att namnet är ledigt.

* <b>Tilldelning av färg:</b> Vid inloggning tilldelas du automatiskt en unik färg och ett unikt ID (via nanoid).

* <b>Live Canvas:</b> Du kan nu rita på den gemensamma ytan. Allt du ritar skickas som koordinater via WebSockets till alla andra anslutna användare i realtid.

* <b>Livechatt:</b> Använd chattfönstret för att skriva med andra. Dina meddelanden dyker upp direkt hos alla som är online.

* <b>Aktiva användare:</b> Du kan se vilka andra som är inloggade just nu i listan för aktiva användare.

* <b>Logga ut:</b> Klicka på logout-knappen för att rensa din session och återgå till startskärmen.

<a name="mockup"></a>
## Mockup:
<img src="./frontend/public/assets/mockup/Skärmbild 2026-02-08 090813.png" alt="App Logo" width="1000">

<a name="screenshots"></a>
<img src="./frontend/public/assets/screenshots/Skärmbild 2026-02-08 090347.png" alt="App Logo" width="1000">
<img src="./frontend/public/assets/screenshots/Skärmbild 2026-02-08 090503.png" alt="App Logo" width="1000">
<img src="./frontend/public/assets/screenshots/Skärmbild 2026-02-08 090512.png" alt="App Logo" width="1000">
<img src="./frontend/public/assets/screenshots/Skärmbild 2026-02-08 090550.png" alt="App Logo" width="1000">

---
<a name="ai-användning"></a>
<details>
<summary style="font-size: 20px; font-weight: 600">AI dokumentering: </summary>

Främst har AI använts vid felsökning när jag fått errors och inte riktigt förstår vart jag ska leta eller hur jag ska försöka korrigera felet.
Jag bollar även frågor när jag vill definera olika kodsnuttar eller hur jag bör tänka i olika delar av koden medans jag kodat.



**Situation:**
Jag försökte få till så att varje spelar/user som loggar in får en egen random färg när dom ritar i sin canvas.
Jag försökte sätta in en fillStyle, strokStyle mm under "draw" i player.js men fick felmeddelande tillbaka.

**Fråga till AI:**
Jag frågade gemini om jag tänker rätt att jag bör koda in random färgval i player.js för det är där vi lägger spec för enskilda spelare och varför jag får fel att "fillStyle eller strokeStyle" inte är en funktion.

**Svar av AI:**
jag fick svaret att jag tänker rätt och med lösningen.
Jag skickade med color från constructor och annars genereras en random färg.

Jag hade tänkt fel och satt färgvalet under draw när den borde sitta under drawStart i Player.js så efter att ha lagt till ctx.strokeStyle = this.color; under drawStart funkar det att varje spelares spontant utvalda färg är den färg som används på deras linjer i fönstret

**Situation:**
Samma username kan skrivas in utan errors eller varningar, alltså kan flera med samma username va online.
Jag gjorde ett par försök med if, else if och else där jag i mina kodblock ville pusha usernames till usersOnline arrayen och sedan kolla med en .inqlude om username redan fanns.

**Frågan till AI:**
Jag la till och frågade vad jag missade i min kod, lösningen var simpel och jag var på god väg med min kod redan, dock var ordningen lite snurrig.

Lösningen blev att korrigera ordningen så att längd och namn i listan kollas först och sedan pushas, jag fick även rådet att använda två if-sater där jag först kollade om namnet fanns redan och i nästa kollade längden och där med en logical OR (||) istället för en logical and (&&).

**Situation:**
Jag frågade AI hur det kommer sig att canvas behöver bredd och höjd på html OCH css och fick vidare råd om att lägga till en inställning i js istället som anpassar canvasrutan efter skärmens faktiska storlek då detta blir mer anpassningsbart.

**Frågan till AI:**
Efter korringering av canvas-rutan har nu linjen spelaren spelar med försvunnit, man kan inte se något när man ritar och inga errors dyker upp, frågan blev varför, vad jag missade i koden.

**Lösning:**
Jag hade dels glömt definera i Player.js under drawstart vad jag ville ha för settings på ctx så dessa skickades inte med som dom skulle. Jag hade även missat att kalla på funktionen som anpassade canvasrutan efter skärmens storlek inne i min submit när en användare loggar in, pga detta blev förmodligen canvasrutan inte i rätt storlek och jag ritade inte på "rätt ställe". 
När funktionen kallades in direkt efter jag plockat bort "hidden" på canvas-elementet så fungerade det att rita.
</details>

---

[Tillbaka till toppen](#top)