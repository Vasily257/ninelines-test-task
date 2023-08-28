/**
 * Получить подходящий источник изображения
 * (имитация логики `srcset` у тега `img`)
 * @param {HTMLImageElement} image Обязательно, элемент изображения
 * @param {number} dpr Обязательно, соотношение пикселей устройства
 */
export const getBestSource = (image, dpr) => {
	let bestSrc = '';

	// Использовать альтернативные URL изображений, если они есть
	const intialSrc = image.getAttribute('data-srcset') || image.getAttribute('data-src');

	// Распарсить строку с URL в массив
	const intialSrcList = intialSrc.split(', ');

	// Перебрать URL и выбрать подходящий на основе формата и dpr
	for (let i = 0; i < intialSrcList.length; i++) {
		const currentintialSrc = intialSrcList[i];

		const isDoubleSize = /(\d+)x$/.test(currentintialSrc);
		const isWebp = /webp/i.test(currentintialSrc);

		if (
			isWebp && dpr >= 1.5 && isDoubleSize ||
			isWebp && dpr < 1.5 && !isDoubleSize ||
			!isWebp && dpr >= 1.5 && isDoubleSize ||
			!isWebp && dpr < 1.5 && !isDoubleSize
		) {
			bestSrc = currentintialSrc.replace(/\s(\d+)x$/, '');
			break;
		}
	}

	return bestSrc;
};
