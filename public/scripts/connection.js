const connection = new WebSocket('ws://localhost:8000');
function listenMessages(listener) {
    connection.addEventListener('message', (event) => {
        listener(sendMessage, event.data);
    });
}
function sendMessage(message) {
    connection.send(JSON.stringify(message));
}
export { connection, listenMessages, sendMessage, };
//# sourceMappingURL=connection.js.map