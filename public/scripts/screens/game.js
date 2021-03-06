const COLOR_CONST = 5;
const FIGURE_CONST = 4;
const title = document.querySelector('main.game h2');
const playerState = {
    clicked: false,
    from: {
        row: 0,
        col: 0
    },
    to: {
        row: 0,
        col: 0
    },
    color: 'white'
};
const chessboard = document.querySelector('.chessboard');
if (!title) {
    throw new Error('Can\'t find required elements on "game" screen');
}
generate(chessboard);
addEvents();
let turnHandler;
function generate(chessboard) {
    let temp_chessboard = '';
    const lib_char = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let lt = '';
    let nm = '';
    for (let i = 8; i >= 1; i--) {
        temp_chessboard += '<div class="row">';
        for (let j = 1; j <= 8; j++) {
            nm = (j === 1 ? ('<span class="num">' + i + '</span>') : '');
            lt = (i === 1 ? ('<span class="let">' + lib_char[j - 1] + '</span>') : '');
            temp_chessboard += ('<div class="col part ' + ((i + j) % 2 === 0 ? 'colored' : 'uncolored') + '" id="' + i + '_' + j + '">' + nm + '' + lt + '</div>');
        }
        temp_chessboard += '</div>';
    }
    chessboard.innerHTML = temp_chessboard;
}
function addEvents() {
    for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
            document.getElementById((i + '_' + j)).addEventListener('click', onClick);
        }
    }
}
function onClick(event) {
    console.log(playerState);
    const cell = event.target;
    let id = cell.id.split('_');
    let colorFig = cell.classList[COLOR_CONST];
    let classlist = cell.classList;
    if (!playerState.clicked && ((playerState.color === 'white' && colorFig === 'black-fig') || (playerState.color === 'black' && colorFig === 'white-fig')))
        return;
    console.log('f1');
    if ((!playerState.clicked && ((playerState.color + '-fig') != colorFig)) || (!playerState.clicked && (classlist.length < FIGURE_CONST)))
        return;
    console.log('f2');
    if (!playerState.clicked) {
        playerState.from.row = Number(id[0]);
        playerState.from.col = Number(id[1]);
        playerState.clicked = true;
        console.log(playerState);
        return;
    }
    playerState.to.row = Number(id[0]);
    playerState.to.col = Number(id[1]);
    playerState.clicked = false;
    turnHandler && turnHandler(playerState);
}
function addFigure(row, col, type) {
    console.log(type[type.length - 1]);
    const cell = document.getElementById((row + '_' + col));
    cell.classList.add('figure');
    cell.classList.add(type.substring(0, type.length - 1));
    cell.classList.add((type[type.length - 1] === 'W' ? 'white-fig' : 'black-fig'));
}
function renderField(field) {
    for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
            if (field[i - 1][j - 1] === '')
                continue;
            addFigure(i, j, field[i - 1][j - 1]);
        }
    }
}
function clearField() {
    for (let i = 8; i >= 1; i--) {
        for (let j = 1; j <= 8; j++) {
            document.getElementById((i + '_' + j)).className = 'col part ' + ((i + j) % 2 === 0 ? 'colored' : 'uncolored');
        }
    }
}
function update(myTurn, gameField, color) {
    console.log(gameField);
    clearField();
    renderField(gameField);
    playerState.color = color;
    if (myTurn) {
        title.textContent = 'Ваш ход';
        return;
    }
    title.textContent = 'Ход противника';
}
function setTurnHandler(handler) {
    turnHandler = handler;
}
export { update, setTurnHandler, };
//# sourceMappingURL=game.js.map