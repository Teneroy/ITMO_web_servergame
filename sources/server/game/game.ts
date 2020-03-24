import WebSocket from 'ws';
import {onError} from './on-error.js';

import {
	AnyClientMessage,
	AnyServerMessage,
	GameAbortedMessage,
	GameStartedMessage,
	PlayerGameState,
} from '../../common/messages.js';

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

	private _playersSet!:  WeakMap<WebSocket, string>;

	private _currentMove!: WebSocket;

	private _gameField!: Array<Array<string>>;
	/**
	 * @param session Сессия игры, содержащая перечень соединений с игроками
	 */
	constructor( session: WebSocket[] )
	{
		this._session = session;
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
		this._playersSet = null as unknown as Game['_playersSet'];
	}
	
	/**
	 * Отправляет сообщение о начале игры
	 */
	private _sendStartMessage(): Promise<void[]>
	{
		this._gameField = [];
		this._gameField = Game._generateGameField(this._gameField);
		this._currentMove = this._session[0];
		this._playersSet = new WeakMap<WebSocket, string>();
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
			this._playersSet.set(player, data.color);
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
			case 'playerMove':
				this._onPlayerRoll( player, message.move );
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

	private static _getColorAbbr(color: string): string
	{
		return (color === 'white' ? 'B' : 'W');
	}
	
	/**
	 * Обрабатывает ход игрока
	 *
	 * @param currentPlayer Игрок, от которого поступило сообщение
	 * @param moveInfo
	 */
	private _onPlayerRoll( currentPlayer: WebSocket, moveInfo: PlayerGameState ): void
	{
		if ( this._currentMove !== currentPlayer )
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

		if (moveInfo.from.col > 8 || moveInfo.to.col > 8 || moveInfo.from.row < 1 || moveInfo.to.row < 1)
		{
			this._sendMessage(
				currentPlayer,
				{
					type: 'incorrectRequest',
					message: 'Out of field',
				},
			)
				.catch( onError );
			return;
		}

		if (moveInfo.from.col === moveInfo.to.col && moveInfo.from.row === moveInfo.to.row)
		{
			this._sendMessage(
				currentPlayer,
				{
					type: 'incorrectRequest',
					message: 'You have to move',
				},
			)
				.catch( onError );
			return;
		}

		const currentColor: string = this._playersSet.get(currentPlayer)!;

		let from: string = this._gameField[moveInfo.from.row - 1][moveInfo.from.col - 1];

		if (from === '' || from[from.length - 1] === Game._getColorAbbr(currentColor))
		{
			this._sendMessage(
				currentPlayer,
				{
					type: 'incorrectRequest',
					message: 'Incorrect request',
				},
			)
				.catch( onError );
			return;
		}



		let player2: WebSocket = currentPlayer;



		this._gameField[moveInfo.to.row - 1][moveInfo.to.col - 1] = this._gameField[moveInfo.from.row - 1][moveInfo.from.col - 1];
		this._gameField[moveInfo.from.row - 1][moveInfo.from.col - 1] = '';


		let endgame: number = 0;
		for ( const player of this._session )
		{
			if(player !== currentPlayer)
				player2 = player;
			endgame |= Number(Game._checkWin( this._gameField, this._playersSet.get(player)! ));
		}

		this._currentMove = player2;

		if ( !endgame )
		{
			this._sendMessage(
				player2,
				{
					type: 'changePlayer',
					myTurn: true,
					gameField: this._gameField,
					color: (currentColor === 'white' ? 'black' : 'white')
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

		for ( const player of this._session )
		{
			this._sendMessage(
				player,
				{
					type: 'gameResult',
					win: Game._checkWin(this._gameField, this._playersSet.get(player)!),
				},
			)
				.catch( onError );
		}
	}

	private static _checkWin(field: Array<Array<string>>, color: string): boolean
	{
		let col: string = Game._getColorAbbr(color);
		for(let i: number = 0; i < 8; i++)
		{
			for (let j: number = 0; j < 8; j++)
			{
				if (field[i][j][field[i][j].length - 1] === col && field[i][j].substring(0, field[i][j].length - 1) === 'king')
					return false
			}
		}
		return true;
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
