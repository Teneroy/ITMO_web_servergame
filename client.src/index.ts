const socket = new WebSocket( 'ws://localhost:8000' );

socket.addEventListener(
	'message',
	( event ) =>
	{
		alert( event.data );
	},
);

export {
	socket,
};
