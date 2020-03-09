import Express from 'express';
import Path from 'path';
import { createServer } from 'http';
import WebSocket from 'ws';
import config from './config.json';

const rootPath = Path.resolve( __dirname, '..' );
process.chdir( rootPath );

const app = Express();
const server = createServer( app );
const wsServer = new WebSocket.Server(
	{
		server
	},
	() =>
	{
		console.log( `WebSocket is listening on port ${config.port}` );
	},
);
server.listen(
	config.port,
	() =>
	{
		console.log( `HTTP is listening on port ${config.port}` );
	},
);

app.use( Express.static( Path.join( rootPath, 'public' ) ) );

type GameSession = {
	player1: WebSocket,
	player2: WebSocket,
};

const connections = {
	waiting: null as WebSocket | null,
	gameSessions: [] as GameSession[],
};

wsServer.on(
	'connection',
	( ws ) =>
	{
		if ( connections.waiting )
		{
			const session: GameSession = {
				player1: connections.waiting,
				player2: ws,
			};
			connections.gameSessions.push( session );
			connections.waiting = null;
			
			startGame( session );
			
			return;
		}
		
		connections.waiting = ws;
	},
);

function startGame( session: GameSession ): void
{
	for ( const player of ['player1', 'player2'] as const )
	{
		session[player].send( 'Let\' play!' );
	}
}
