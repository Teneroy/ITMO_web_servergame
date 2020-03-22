/**
 * Заголовок экрана
 */
import { PlayerGameState } from "../../common/messages";

enum ClassesPositions {
	COLOR_CONST = 5,
	FIGURE_CONST = 4
}

const title = document.querySelector( 'main.game h2' ) as HTMLHeadingElement;

const playerState: PlayerGameState = {
	clicked: false,
	from: {
		row: 0,
		col: 0
	},
	to: {
		row: 0,
		col: 0
	},
	color: ''
};

/**
 * Игровая доска
 */
const chessboard = document.querySelector('.chessboard') as HTMLInputElement;

if ( !title )
{
	throw new Error( 'Can\'t find required elements on "game" screen' );
}

/**
 * Генерируем доску
 */
generate(chessboard);

addEvents();

/**
 * Обработчик хода игрока
 */
type TurnHandler = (move: PlayerGameState) => void;

/**
 * Обработчик хода игрока
 */
let turnHandler: TurnHandler;


/**
 * Генерирует доску
 * @param chessboard игровая доска
 */
function generate(chessboard : HTMLElement): void
{
	let temp_chessboard: string = '';
	const lib_char: Array<string>  = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
	let lt: string = '';
	let nm: string = '';
	for(let i: number = 8; i >= 1; i--) {
		temp_chessboard += '<div class="row">';
		for(let j: number = 1; j <= 8; j++) {
			nm = (j == 1 ? ('<span class="num">' + i + '</span>') : '');
			lt = (i == 1 ? ('<span class="let">' + lib_char[j - 1] + '</span>') : '');
			temp_chessboard += ('<div class="col part ' + ((i + j) % 2 == 0 ? 'colored' : 'uncolored') + '" id="' + i + '_' + j + '">' + nm + '' + lt + '</div>');
		}
		temp_chessboard += '</div>';
	}
	chessboard.innerHTML = temp_chessboard;
}

function addEvents(): void
{
	for (let i: number = 1; i <= 8; i++ ) {
		for(let j: number = 1; j <= 8; j++) {
			// @ts-ignore
			document.getElementById((i + '_' + j)).addEventListener('click', onClick);
		}
	}
}

/**
 * Обрабатывает нажатие на клетку
 *
 * @param event
 */
function onClick( event: Event ): void
{
	console.log(playerState);
	const cell = event.target as HTMLElement;
	let id = cell.id.split('_');
	let colorFig = cell.classList[ClassesPositions.COLOR_CONST];
	let classlist = cell.classList;
	if(!playerState.clicked && ((playerState.color == 'white' && colorFig == 'black-fig') || (playerState.color == 'black' && colorFig == 'white-fig')) )
		return;
	console.log('f1');
	if((!playerState.clicked && ( (playerState.color + '-fig') != colorFig )) || (!playerState.clicked && (classlist.length < ClassesPositions.FIGURE_CONST)))
		return;
	console.log('f2');
	if(!playerState.clicked)
	{
		playerState.from.row = Number(id[0]);
		playerState.from.col = Number(id[1]);
		playerState.clicked = true;
		console.log(playerState);
		return;
	}
	playerState.to.row = Number(id[0]);
	playerState.to.col = Number(id[1]);
	playerState.clicked = false;
	turnHandler && turnHandler( playerState );
}

/**
 * Генерирует доску
 * @param row позиция по y
 * @param col позиция по x
 * @param type фигура
 */
function addfigure(row: number, col: number, type: string): void
{
	console.log(type[type.length - 1]);
	const cell = document.getElementById((row + '_' + col)) as HTMLElement;
	cell.classList.add('figure');
	cell.classList.add(type.substring(0, type.length - 1));
	cell.classList.add((type[type.length - 1] === 'W' ? 'white-fig' : 'black-fig'));
}

function renderField(field: Array<Array<string>>): void
{
	for (let i: number = 1; i <= 8; i++ ) {
		for(let j: number = 1; j <= 8; j++) {
			if(field[i - 1][j - 1] === '')
				continue;
			addfigure(i, j, field[i - 1][j - 1]);
		}
	}
}

function clearField(): void
{
	for (let i: number = 8; i >= 1; i--) {
		for(let j: number = 1; j <= 8; j++) {
			// @ts-ignore
			document.getElementById((i + '_' + j)).className = 'col part ' + ((i + j) % 2 == 0 ? 'colored' : 'uncolored');
		}
	}
}



/**
 * Обновляет экран игры
 *
 * @param myTurn Ход текущего игрока?
 * @param gameField игровое поле
 * @param color
 */
function update( myTurn: boolean, gameField: Array<Array<string>>, color: string ): void
{
	console.log(gameField);
	clearField();
	renderField(gameField);
	playerState.color = color;
	if ( myTurn )
	{
		title.textContent = 'Ваш ход';
		return;
	}
	title.textContent = 'Ход противника';
}

/**
 * Устанавливает обработчик хода игрока
 *
 * @param handler Обработчик хода игрока
 */
function setTurnHandler( handler: TurnHandler ): void
{
	turnHandler = handler;
}

export {
	update,
	setTurnHandler,
};
