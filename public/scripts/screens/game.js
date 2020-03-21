var ClassesPositions;
(function (ClassesPositions) {
    ClassesPositions[ClassesPositions["COLOR_CONST"] = 5] = "COLOR_CONST";
    ClassesPositions[ClassesPositions["FIGURE_CONST"] = 4] = "FIGURE_CONST";
})(ClassesPositions || (ClassesPositions = {}));
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
    color: ''
};
const chessboard = document.querySelector('.chessboard');
if (!title) {
    throw new Error('Can\'t find required elements on "game" screen');
}
generate(chessboard);
addEvents();
function generate(chessboard) {
    let temp_chessboard = '';
    const lib_char = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let lt = '';
    let nm = '';
    for (let i = 8; i >= 1; i--) {
        temp_chessboard += '<div class="row">';
        for (let j = 1; j <= 8; j++) {
            nm = (j == 1 ? ('<span class="num">' + i + '</span>') : '');
            lt = (i == 1 ? ('<span class="let">' + lib_char[j - 1] + '</span>') : '');
            temp_chessboard += ('<div class="col part ' + ((i + j) % 2 == 0 ? 'colored' : 'uncolored') + '" id="' + i + '_' + j + '">' + nm + '' + lt + '</div>');
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
    const cell = event.target;
    let id = cell.id.split('_');
    let colorFig = cell.classList[ClassesPositions.COLOR_CONST];
    let classlist = cell.classList;
    console.log(id);
    console.log(colorFig);
    console.log(classlist);
    if ((playerState.color == 'white' && colorFig == 'black-fig') || (playerState.color == 'black' && colorFig == 'white-fig'))
        return;
    if ((!playerState.clicked && ((playerState.color + '-fig') != colorFig)) || (!playerState.clicked && (classlist.length < ClassesPositions.FIGURE_CONST)))
        return;
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
    console.log(playerState);
}
function addfigure(row, col, type) {
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
            addfigure(i, j, field[i - 1][j - 1]);
        }
    }
}
function update(myTurn, gameField, color) {
    console.log(gameField);
    renderField(gameField);
    playerState.color = color;
    if (myTurn) {
        title.textContent = 'Ваш ход';
        return;
    }
    title.textContent = 'Ход противника';
}
function setTurnHandler(handler) {
    console.log(handler);
}
export { update, setTurnHandler, };
//# sourceMappingURL=game.js.map