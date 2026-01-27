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