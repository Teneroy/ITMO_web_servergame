import type {
	default as WebSocket,
	Server,
} from 'ws';

/**
 * Игра, поддерживающая игровые сессии
 */
type GameWithSession = {
	/**
	 * Количество игроков в игровой сессии
	 */
	readonly PLAYERS_IN_SESSION: number;
	
	/**
	 * Конструктор игры, поддерживающей игровые сессии
	 */
	new ( session: WebSocket[] ): unknown;
};

/**
 * Добавляет слушатель подключения клиентов на сокет, с запуском игры
 * при наборе нужного количества игроков
 * 
 * @param server WebSocket-сервер
 * @param Game Класс игры
 */
function listenOn( server: Server, Game: GameWithSession ): void
{
	let newSession: WebSocket[] = [];
	
	server.on(
		'connection',
		( connection ) =>
		{
			newSession.push( connection );
			
			if ( newSession.length === Game.PLAYERS_IN_SESSION )
			{
				new Game( newSession );
				newSession = [];
			}
		},
	);
}

export {
	listenOn,
};

export type {
	GameWithSession,
};
