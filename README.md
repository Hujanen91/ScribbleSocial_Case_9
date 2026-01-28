# ScribbleSocial_Case_9
Case 9 Websocket Canvas - Glimåkra

En plattform för gruppchatt med en anslagstavla där användarna kan rita medans dom pratar.
Skapat med JavaScript, Node, CSS, HTML och Canvas


AI dokumentering:

Situation:
Jag försökte få till så att varje spelar/user som loggar in får en egen random färg när dom ritar i sin canvas.
Jag försökte sätta in en fillStyle, strokStyle mm under "draw" i player.js men fick felmeddelande tillbaka.

Fråga till AI:
Jag frågade gemini om jag tänker rätt att jag bör koda in random färgval i player.js för det är där vi lägger spec för enskilda spelare och varför jag får fel att "fillStyle eller strokeStyle" inte är en funktion.

Svar av AI:
jag fick svaret att jag tänker rätt och med lösningen.
Jag skickade med color från constructor och annars genereras en random färg.

Jag hade tänkt fel och satt färgvalet under draw när den borde sitta under drawStart i Player.js så efter att ha lagt till ctx.strokeStyle = this.color; under drawStart funkar det att varje spelares spontant utvalda färg är den färg som används på deras linjer i fönstret

Situation:
Samma username kan skrivas in utan errors eller varningar, alltså kan flera med samma username va online.
Jag gjorde ett par försök med if, else if och else där jag i mina kodblock ville pusha usernames till usersOnline arrayen och sedan kolla med en .inqlude om username redan fanns.

Frågan till AI:
Jag la till och frågade vad jag missade i min kod, lösningen var simpel och jag var på god väg med min kod redan, dock var ordningen lite snurrig.

Lösningen blev att korrigera ordningen så att längd och namn i listan kollas först och sedan pushas, jag fick även rådet att använda två if-sater där jag först kollade om namnet fanns redan och i nästa kollade längden och där med en logical OR (||) istället för en logical and (&&).