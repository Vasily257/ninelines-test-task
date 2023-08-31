/**
 * Получить подходящий источник изображения
 * (имитация логики `srcset` у тега `img`)
 * @param {string} src один или несколько источников (URL) изображений (обязательное)
 * @param {number} dpr соотношение пикселей устройства (обязательное)
 * @param {boolean} isWebpSupport поддерживает ли браузер WebP (обязательное)
 */

export const getBestSource = (src, dpr, isWebpSupport) => {
	let bestSrc = '';

	// Распарсить строку с URL в массив
	const srcList = src.split(', ');

	// Перебрать URL и выбрать подходящий на основе формата и dpr
	for (let i = 0; i < srcList.length; i++) {
		const currentSrc = srcList[i];

		/** Есть ли источники с повышенной плотностью пикселей в строке URL */
		const hasRetina = /\s([2-4])x$/.test(currentSrc);
		/** Есть ли WebP-источники в строке URL */
		const hasWebp = /webp/i.test(currentSrc);

		if (dpr >= 1.5 && hasRetina && isWebpSupport && hasWebp) {
			bestSrc = currentSrc.replace(/\s(\d+)x$/, '');
			break;
		}

		if (dpr >= 1.5 && hasRetina && !hasWebp) {
			bestSrc = currentSrc.replace(/\s(\d+)x$/, '');
			break;
		}

		if (dpr < 1.5 && !hasRetina && isWebpSupport && hasWebp) {
			bestSrc = currentSrc;
			break;
		}

		if (dpr < 1.5 && !hasRetina && !hasWebp) {
			bestSrc = currentSrc;
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
