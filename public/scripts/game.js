import { openScreen } from './screens.js';
import * as GameScreen from './screens/game.js';
import * as ResultScreen from './screens/result.js';
GameScreen.setTurnHandler(turnHandler);
ResultScreen.setRestartHandler(restartHandler);
let sendMessage;
function setSendMessage(sendMessageFunction) {
    sendMessage = sendMessageFunction;
}
function turnHandler(move) {
    sendMessage({
        type: 'playerMove',
        move: move,
    });
}
function restartHandler() {
    sendMessage({
        type: 'repeatGame',
    });
}
function startGame() {
    openScreen('game');
}
function changePlayer(myTurn, gameField, color) {
    GameScreen.update(myTurn, gameField, color);
}
function endGame(result) {
    ResultScreen.update(result);
    openScreen('result');
}
export { startGame, changePlayer, endGame, setSendMessage, };
//# sourceMappingURL=game.js.map