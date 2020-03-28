/**
 * Начало игры
 */
export type PlayerColor = 'white' | 'black';


export type GameStartedMessage = {
	/** Тип сообщения */
	type: 'gameStarted';
	/** Мой ход? */
	myTurn: boolean;
	/** игровое поле */
	gameField: Array<Array<string>>;
	/** цвет игрока */
	color: PlayerColor;
};

export type CellPosition = {
	row: number;
	col: number;
};

export type PlayerGameState = {
	clicked: boolean;
	from: CellPosition;
	to: CellPosition;
	color: PlayerColor;
};

/**
 * Игра прервана
 */
export type GameAbortedMessage = {
	/** Тип сообщения */
	type: 'gameAborted';
};

/**
 * Ход игрока
 */
export type PlayerMoveMessage = {
	/** Тип сообщения */
	type: 'playerMove';
	/** Число, названное игроком */
	move: PlayerGameState;
};

/**
 * Результат хода игроков
 */
export type GameResultMessage = {
	/** Тип сообщения */
	type: 'gameResult';
	/** Победа? */
	win: boolean;
};

/**
 * Смена игрока
 */
export type ChangePlayerMessage = {
	/** Тип сообщения */
	type: 'changePlayer';
	/** Мой ход? */
	myTurn: boolean;
	/** игровое поле */
	gameField: Array<Array<string>>;
	/** цвет игрока */
	color: PlayerColor;
};

/**
 * Повтор игры
 */
export type RepeatGame = {
	/** Тип сообщения */
	type: 'repeatGame';
};

/**
 * Некорректный запрос клиента
 */
export type IncorrectRequestMessage = {
	/** Тип сообщения */
	type: 'incorrectRequest';
	/** Сообщение об ошибке */
	message: string;
};

/**
 * Некорректный ответ сервера
 */
export type IncorrectResponseMessage = {
	/** Тип сообщения */
	type: 'incorrectResponse';
	/** Сообщение об ошибке */
	message: string;
};




/**
 * Сообщения от сервера к клиенту
 */
export type AnyServerMessage =
	| GameStartedMessage
	| GameAbortedMessage
	| GameResultMessage
	| ChangePlayerMessage
	| IncorrectRequestMessage
	| IncorrectResponseMessage;

/** 
 * Сообщения от клиента к серверу
 */
export type AnyClientMessage =
	| PlayerMoveMessage
	| RepeatGame
	| IncorrectRequestMessage
	| IncorrectResponseMessage;
