import html2canvas from 'html2canvas';

/**
 * Инициализировать компонент
 * @public
 */
const init = async () => {
	const shareElement = document.querySelector('.share');
	const textBox = shareElement.querySelector('.share__text-box');

	const titleElement = document.getElementById('sharing-title');
	const descriptionElement = document.getElementById('sharing-description');

	try {
		const titleCanvas = await html2canvas(titleElement);
		const descriptionCanvas = await html2canvas(descriptionElement);

		textBox.prepend(descriptionCanvas);
		textBox.prepend(titleCanvas);
	} catch (error) {
		throw new Error(`Не удалось динамически получить данные для шеринга: ${error}`);
	}
};

export default {
	init,
};
