# ScribbleSocial
Case 9 Websocket Canvas

En plattform för gruppchatt med en anslagstavla där användarna kan rita medans dom pratar.

Hemsidan finns publicerad på Netlify: <br>
[ScribbleSocial](https://scribblesocial.netlify.app/) 

## Innehållsförteckning
* [Om projektet](#om-projektet)
* [Tekniker](#tekniker)
* [Installation](#installation)
* [Användning](#användning)
* [Design](#design)
* [Screenshots](#screenshots)
* [AI-Användning](#ai-användning)

---

<a name="om-projektet"></a>
## Om projektet

<a name="tekniker"></a>
## Tekniker
Lista de verktyg och språk du använt:
* **Frontend:** HTML5, CSS3, JavaScript (ES6)
* **Backend:** Node.js, WebSocket (WS)
* **Verktyg:** DevTools, Render och Netlify (för deployment)

<a name="installation"></a>
## Installation
Steg-för-steg instruktioner om hur man får projektet att köra lokalt:

<a name="användning"></a>

<a name="design"></a>

<a name="screenshots"></a>

<a name="ai-användning"></a>
## AI dokumentering:

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