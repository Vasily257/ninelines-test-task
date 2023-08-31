/**
 * Получить подходящий источник изображения
 * (имитация логики `srcset` у тега `img`)
 * @param {string} src один или несколько источников (URL) изображений (обязательное)
 * @param {number} dpr соотношение пикселей устройства (обязательное)
 */
export const getBestSource = (src, dpr) => {
	let bestSrc = '';

	// Распарсить строку с URL в массив
	const intialSrcList = src.split(', ');

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
			// Убрать множитель в конце строки
			bestSrc = currentintialSrc.replace(/\s(\d+)x$/, '');
			break;
		}
	}

	return bestSrc;
};

/** Проверить поддержку WebP в браузере */
export const checkWebpSupport = async () => {
	let isWebpSupport = false;

	const webP = new Image();

	// Двухпиксельный квадрат в формате WebP
	webP.src =
		'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

	await new Promise((resolve) => {
		webP.onload = () => {
			if (webP.height === 2) {
				isWebpSupport = true;
			}

			resolve();
		};

		webP.onerror = () => {
			if (webP.height === 2) {
				isWebpSupport = true;
			}

			resolve();
		};
	});

	return isWebpSupport;
};
