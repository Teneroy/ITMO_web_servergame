import { startGame, changePlayer, endGame, setSendMessage } from './game.js';
function onMessage(sendMessage, data) {
    setSendMessage(sendMessage);
    const message = parseData(data);
    processMessage(sendMessage, message);
}
function parseData(data) {
    if (typeof data !== 'string') {
        return {
            type: 'incorrectResponse',
            message: 'Wrong data type',
        };
    }
    try {
        return JSON.parse(data);
    }
    catch (error) {
        return {
            type: 'incorrectResponse',
            message: 'Can\'t parse JSON data: ' + error,
        };
    }
}
function processMessage(sendMessage, message) {
    switch (message.type) {
        case 'gameStarted':
            startGame();
            changePlayer(message.myTurn, message.gameField, message.color);
            break;
        case 'changePlayer':
            changePlayer(message.myTurn, message.gameField, message.color);
            break;
        case 'gameResult':
            endGame(message.win ? 'win' : 'loose');
            break;
        case 'gameAborted':
            endGame('abort');
            break;
        case 'incorrectRequest':
            console.error('Incorrect request: ', message.message);
            break;
        case 'incorrectResponse':
            sendMessage(message);
            break;
        default:
            sendMessage({
                type: 'incorrectResponse',
                message: `Unknown message type: "${message.type}"`,
            });
            break;
    }
}
export { onMessage, };
//# sourceMappingURL=on-message.js.map