import Express from 'express';
import Path from 'path';
import { createServer } from 'http';
import WebSocket from 'ws';
import config from '../config.json';

/**
 * Приложение Express
 */
const expressApp = Express();
/**
 * Сервер HTTP
 */
const httpServer = createServer( expressApp );
/**
 * Сервер WebSocket
 */
const wsServer = new WebSocket.Server(
	{
		server: httpServer,
	},
	() =>
	{
		console.log( `WebSocket is listening on port ${config.port}` );
	},
);

httpServer.listen(
	config.port,
	() =>
	{
		console.log( `HTTP is listening on port ${config.port}` );
	},
);

expressApp.use( Express.static( Path.join( process.cwd(), 'public' ) ) );

export {
	expressApp,
	httpServer,
	wsServer,
};
