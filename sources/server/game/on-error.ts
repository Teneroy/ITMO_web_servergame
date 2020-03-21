/**
 * Обрабатывает ошибку отправки
 * 
 * @param error Объект ошибки
 */
function onError( error: Error ): void
{
	console.error( error );
}

export {
	onError,
};
