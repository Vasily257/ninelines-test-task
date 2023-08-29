import {getBestSource} from '../modules/srcSet';

let allImagesTotalBytes;
let allImagesLoadedBytes;

/**
 * Добавить предварительную загрузку прелоадера
 * @private
 */
function addPreloadOfPreloader() {
	const dpr = window.devicePixelRatio;
	const initialSrc =
		'./images/guy-on-rocket.webp, ./images/guy-on-rocket@2x.webp 2x, ./images/guy-on-rocket.png, ./images/guy-on-rocket@2x.png 2x,';
	const preloadLink = document.createElement('link');

	preloadLink.rel = 'preload';
	preloadLink.href = getBestSource(initialSrc, dpr);
	preloadLink.as = 'image';

	document.head.appendChild(preloadLink);
}

/**
 * Обработать прогресс загрузки изображения
 * @private
 * @param {ProgressEvent} event событие прогресса (обязательное)
 */
function handleImageProgress(event) {
	let isNotTotalSent = true;

	if (event.lengthComputable) {
		if (isNotTotalSent) {
			allImagesTotalBytes = event.total;
			isNotTotalSent = false;
		}

		allImagesLoadedBytes += event.loaded;
	}
}

/**
 * Добавить слушатель события загрузки изображения
 * @private
 * @param {XMLHttpRequest} xhr запрос на загрузку (обязательное)
 * @param {HTMLImageElement} image элемент изображения (обязательное)
 * @param {string} url ссылка на источник изображения (обязательное)
 */
function addImageLoadListener({xhr, image, url}) {
	// Создать изображение из BLOB-данных
	const handleImageUpload = () => {
		if (xhr.status === 200) {
			const blob = xhr.response;
			const imgObjectURL = URL.createObjectURL(blob);
			image.src = imgObjectURL;
		} else {
			throw new Error(`Ошибка загрузки изображения ${url}. Статус: ${xhr.status}`);
		}
	};

	// Добавить обработчик
	xhr.addEventListener('load', handleImageUpload);

	// Вернуть обработчик, чтобы его можно было удалить
	return handleImageUpload;
}

/**
 * Добавить слежение за загрузкой изображений
 * @private
 */
function addMonitoringImages() {
	const images = document.querySelectorAll('img[data-src]');
	const dpr = window.devicePixelRatio;

	for (let i = 0; i < images.length; i++) {
		let image = images[i];

		// Строка с источником (источниками) изображений
		const intialSrc = image.getAttribute('data-srcset') || image.getAttribute('data-src');

		/** Ссылка на изображение */
		const url = getBestSource(intialSrc, dpr);

		/** Инициализация запроса */
		const xhr = new XMLHttpRequest();

		// Выполнить запрос, чтобы получить изображение
		xhr.open('GET', url, true);

		// Перевести изображение в формат BLOB
		xhr.responseType = 'blob';

		// Добавить слушатель (прогресс загрузки изображения)
		xhr.addEventListener('progress', handleImageProgress);

		// Добавить слушатель (полная загрузка изображения)
		addImageLoadListener({
			xhr,
			image,
			url,
		});

		xhr.send();
	}
}

/**
 * Добавить слушатель события загрузки DOM
 * @private
 */
function handleDomContentLoaded() {
	addPreloadOfPreloader();
	addMonitoringImages();
}

/**
 * Инициализировать страницу
 * @public
 */
function init() {
	document.addEventListener('DOMContentLoaded', handleDomContentLoaded);
}

export default {
	init,
};
