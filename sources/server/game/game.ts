import WebSocket from 'ws';
import { onError } from './on-error.js';

import type {
	AnyClientMessage,
	AnyServerMessage,
	GameStartedMessage,
	GameAbortedMessage,
} from '../../common/messages.js';

type GamePlayer = {
	player: WebSocket;
	color: string;
}

/**
 * Класс игры
 * 
 * Запускает игровую сессию.
 */
class Game
{
	/**
	 * Количество игроков в сессии
	 */
	static readonly PLAYERS_IN_SESSION = 2;
	
	/**
	 * Игровая сессия
	 */
	private _session: WebSocket[];

	private _playersSet: GamePlayer[];

	/**
	 * Информация о ходах игроков
	 */
	private _playersState!: WeakMap<WebSocket, number | null>;

	private _gameField: Array<Array<string>>;
	/**
	 * @param session Сессия игры, содержащая перечень соединений с игроками
	 */
	constructor( session: WebSocket[] )
	{
		this._session = session;

		this._playersSet = [];

		this._gameField = [];
		this._gameField = Game._generateGameField(this._gameField);

		this._sendStartMessage()
			.then(
				() =>
				{
					this._listenMessages();
				}
			)
			.catch( onError );
	}
	
	/**
	 * Уничтожает данные игровой сессии
	 */
	destroy(): void
	{
		// Можно вызвать только один раз
		this.destroy = () => {};
		
		for ( const player of this._session )
		{
			if (
				( player.readyState !== WebSocket.CLOSED )
				&& ( player.readyState !== WebSocket.CLOSING )
			)
			{
				const message: GameAbortedMessage = {
					type: 'gameAborted',
				};
				
				this._sendMessage( player, message )
					.catch( onError );
				player.close();
			}
		}
		
		// Обнуляем ссылки
		this._session = null as unknown as Game['_session'];
		this._playersState = null as unknown as Game['_playersState'];
	}
	
	/**
	 * Отправляет сообщение о начале игры
	 */
	private _sendStartMessage(): Promise<void[]>
	{
		this._playersState = new WeakMap();
		
		const data: GameStartedMessage = {
			type: 'gameStarted',
			myTurn: true,
			gameField: this._gameField,
			color: 'white'
		};
		const promises: Promise<void>[] = [];
		
		for ( const player of this._session )
		{
			promises.push( this._sendMessage( player, data ) );
			this._playersSet.push( {player: player, color: data.color} );
			data.myTurn = false;
			data.color = 'black';
		}
		
		return Promise.all( promises );
	}
	
	/**
	 * Отправляет сообщение игроку
	 * 
	 * @param player Игрок
	 * @param message Сообщение
	 */
	private _sendMessage( player: WebSocket, message: AnyServerMessage ): Promise<void>
	{
		return new Promise(
			( resolve, reject ) =>
			{
				player.send(
					JSON.stringify( message ),
					( error ) =>
					{
						if ( error )
						{
							reject();
							
							return;
						}
						
						resolve();
					}
				)
			},
		);
	}
	
	/**
	 * Добавляет слушателя сообщений от игроков
	 */
	private _listenMessages(): void
	{
		for ( const player of this._session )
		{
			player.on(
				'message',
				( data ) =>
				{
					const message = this._parseMessage( data );
					
					this._processMessage( player, message );
				},
			);
			
			player.on( 'close', () => this.destroy() );
		}
	}
	
	/**
	 * Разбирает полученное сообщение
	 * 
	 * @param data Полученное сообщение
	 */
	private _parseMessage( data: unknown ): AnyClientMessage
	{
		if ( typeof data !== 'string' )
		{
			return {
				type: 'incorrectRequest',
				message: 'Wrong data type',
			};
		}
		
		try
		{
			return JSON.parse( data );
		}
		catch ( error )
		{
			return {
				type: 'incorrectRequest',
				message: 'Can\'t parse JSON data: ' + error,
			};
		}
	}
	
	/**
	 * Выполняет действие, соответствующее полученному сообщению
	 * 
	 * @param player Игрок, от которого поступило сообщение
	 * @param message Сообщение
	 */
	private _processMessage( player: WebSocket, message: AnyClientMessage ): void
	{
		switch ( message.type )
		{
			case 'playerRoll':
				this._onPlayerRoll( player, message.number );
				break;
			
			case 'repeatGame':
				this._sendStartMessage()
					.catch( onError );
				break;
			
			case 'incorrectRequest':
				this._sendMessage( player, message )
					.catch( onError );
				break;
			
			case 'incorrectResponse':
				console.error( 'Incorrect response: ', message.message );
				break;
			
			default:
				this._sendMessage(
					player,
					{
						type: 'incorrectRequest',
						message: `Unknown message type: "${(message as AnyClientMessage).type}"`,
					},
				)
					.catch( onError );
				break;
		}
	}
	
	/**
	 * Обрабатывает ход игрока
	 * 
	 * @param currentPlayer Игрок, от которого поступило сообщение
	 * @param currentPlayerNumber Число, загаданное игроком
	 */
	private _onPlayerRoll( currentPlayer: WebSocket, currentPlayerNumber: number ): void
	{
		if ( this._playersState.get( currentPlayer ) != null )
		{
			this._sendMessage(
				currentPlayer,
				{
					type: 'incorrectRequest',
					message: 'Not your turn',
				},
			)
				.catch( onError );
			
			return;
		}
		
		this._playersState.set( currentPlayer, currentPlayerNumber );
		
		let maxNumber: number = currentPlayerNumber;
		let maxNumberPlayer: WebSocket = currentPlayer;
		let currentColor: string = '';

		for ( const element of this._playersSet )
		{
			if(element.player === currentPlayer)
				currentColor = element.color;
		}

		for ( const player of this._session )
		{
			const playerNumber = this._playersState.get( player );
			
			if ( playerNumber == null )
			{
				this._sendMessage(
					player,
					{
						type: 'changePlayer',
						myTurn: true,
						gameField: this._gameField,
						color: (currentColor === 'white' ? 'white' : 'black')
					},
				)
					.catch( onError );
				this._sendMessage(
					currentPlayer,
					{
						type: 'changePlayer',
						myTurn: false,
						gameField: this._gameField,
						color: currentColor
					},
				)
					.catch( onError );
				
				return;
			}
			
			if ( playerNumber > maxNumber )
			{
				maxNumber = playerNumber;
				maxNumberPlayer = player;
			}
		}
		
		for ( const player of this._session )
		{
			this._sendMessage(
				player,
				{
					type: 'gameResult',
					win: ( player === maxNumberPlayer ),
				},
			)
				.catch( onError );
		}
	}

	/**
	 * Заполняем поле в начальное состояние
	 * @param field игровое поле
	 */
	private static _generateGameField(field: Array<Array<string>>): Array<Array<string>>
	{
		let gameField: Array<Array<string>> = field;
		for (let i: number = 1; i <= 8; i++ ) {
			gameField.push([]);
			for(let j: number = 1; j <= 8; j++) {
				gameField[i - 1].push((i === 2 || i === 7) ? (i === 2 ? 'pawnW' : 'pawnB') : '');
			}
			if(i === 1 || i === 8)
			{
				gameField[i - 1][8 - 1] = (i === 1 ? 'rookW' : 'rookB');
				gameField[i - 1][1 - 1] = (i === 1 ? 'rookW' : 'rookB');
				gameField[i - 1][7 - 1] = (i === 1 ? 'knightW' : 'knightB');
				gameField[i - 1][2 - 1] = (i === 1 ? 'knightW' : 'knightB');
				gameField[i - 1][6 - 1] = (i === 1 ? 'bishopW' : 'bishopB');
				gameField[i - 1][3 - 1] = (i === 1 ? 'bishopW' : 'bishopB');
				gameField[i - 1][5 - 1] = (i === 1 ? 'queenW' : 'queenB');
				gameField[i - 1][4 - 1] = (i === 1 ? 'kingW' : 'kingB');
			}
		}
		return gameField;
	}
}

export {
	Game,
};
