const message = document.querySelector('main.result>p');
const restart = document.querySelector('main.result>button.restart');
if (!message || !restart) {
    throw new Error('Can\'t find required elements on "result" screen');
}
function update(result) {
    restart.hidden = false;
    let text;
    switch (result) {
        case 'win':
            text = 'Вы выиграли';
            break;
        case 'loose':
            text = 'Вы проиграли';
            break;
        case 'abort':
            text = 'Игра прервана';
            restart.hidden = true;
            break;
        default:
            throw new Error(`Wrong game result "${result}"`);
    }
    message.textContent = text;
}
function setRestartHandler(listener) {
    restart.addEventListener('click', listener);
}
export { update, setRestartHandler, };
//# sourceMappingURL=result.js.map