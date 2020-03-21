const screens = getScreens();
function getScreens() {
    const waiting = document.querySelector('main.waiting');
    if (!waiting) {
        throw new Error('Can\'t find "waiting" screen');
    }
    const game = document.querySelector('main.game');
    if (!game) {
        throw new Error('Can\'t find "game" screen');
    }
    const result = document.querySelector('main.result');
    if (!result) {
        throw new Error('Can\'t find "result" screen');
    }
    return {
        waiting,
        game,
        result,
    };
}
function openScreen(screen) {
    for (const [key, value] of Object.entries(screens)) {
        value.hidden = (key !== screen);
    }
}
function getCurrentScreen() {
    for (const screen of Object.values(screens)) {
        if (!screen.hidden) {
            return screen;
        }
    }
    throw new Error('Can\'t find current screen');
}
export { screens, openScreen, getCurrentScreen, };
//# sourceMappingURL=screens.js.map