/**
 * Сообщение с итогом игры
 */
const message = document.querySelector( 'main.result>p' ) as HTMLParagraphElement;
/**
 * Кнопка перезапуска игры
 */
const restart = document.querySelector( 'main.result>button.restart' ) as HTMLButtonElement;

if ( !message || !restart )
{
	throw new Error( 'Can\'t find required elements on "result" screen' );
}

/**
 * Обновляет экран завершения игры
 * 
 * @param result Результат, с которым игра завершилась
 */
function update( result: 'win' | 'loose' | 'abort' ): void
{
	restart.hidden = false;
	
	let text: string;
	
	switch ( result )
	{
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
			throw new Error( `Wrong game result "${result}"` );
	}
	
	message.textContent = text;
}

/**
 * Устанавливает обработчик перезапуска игры
 * 
 * @param listener Обработчик перезапуска игры
 */
function setRestartHandler( listener: ( event: MouseEvent ) => void ): void
{
	restart.addEventListener( 'click', listener );
}

export {
	update,
	setRestartHandler,
};
