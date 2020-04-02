# ITMO_web_servergame
Chess game prototype. 
Using http for static data, and WebSocket for players connection. 
## Game rules
Players make moves step by step. If player eat enemies king, player win.
## Start
Installing dependencies:
```
npm i
```
Building project: 
```
npm run build
```
Starting gameserver:
```
npm start
```
## Player connection
Open http://localhost:8000/
Game starts when 2 players are connected. Server send two connected players to the game. 
