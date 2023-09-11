/**
 * Инициализировать компонент
 * @public
 */
const init = async () => {
	try {
		const titleCanvas = await window.html2canvas(document.getElementById('sharing-title'));
		const descriptionCanvas = await window.html2canvas(document.getElementById('sharing-description'));

		const canvasContainer = document.querySelector('.share');

		canvasContainer.appendChild(titleCanvas);
		canvasContainer.appendChild(descriptionCanvas);
	} catch (error) {
		throw new Error(`Не удалось динамически получить данные для шеринга: ${error}`);
	}
};

export default {
	init,
};
