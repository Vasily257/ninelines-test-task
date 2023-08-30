import {getBestSource} from '../modules/srcSet';

/**
 * Инициализировать страницу
 * @public
 */
const init = () => {
	/** Количество всех байт изображений */
	let allImagesTotalBytes = 0;
	/** Количество загруженных байт изображений */
	let allImagesLoadedBytes = 0;
	/** Соотношение виртуальных и физических пикселей */
	const dpr = window.devicePixelRatio;

	/**
	 * Добавить предварительную загрузку прелоадера
	 * @private
	 */
	const addPreloadOfPreloader = () => {
		const preloaderSrc =
			'./images/guy-on-rocket.webp, ./images/guy-on-rocket@2x.webp 2x, ./images/guy-on-rocket.png, ./images/guy-on-rocket@2x.png 2x,';
		const preloadLink = document.createElement('link');

		preloadLink.rel = 'preload';
		preloadLink.href = getBestSource(preloaderSrc, dpr);
		preloadLink.as = 'image';

		document.head.appendChild(preloadLink);
	};

	/**
	 * Получить размер одного изображения
	 * @private
	 * @param {string} url путь к изображению (обязательное)
	 */
	const getSizeOfOneImage = (url) => {
		return new Promise((resolve, reject) => {
			/** Инициализация запроса */
			const xhr = new XMLHttpRequest();

			// Выполнить запрос, чтобы получить метаданные изображения
			xhr.open('HEAD', url, true);

			xhr.onload = () => {
				/** Размер изображения в байтах */
				const contentLength = xhr.getResponseHeader('Content-Length');

				if (contentLength) {
					// Вернуть ссылку на изображение и его размер в случае успеха
					resolve({
						url,
						size: parseInt(contentLength, 10),
					});
				} else {
					reject(new Error(`Не удалось получить размер для изображения: ${url}`));
				}
			};

			xhr.onerror = () => {
				reject(new Error(`Ошибка при запросе метаданных для изображения: ${url}`));
			};

			xhr.send();
		});
	};

	/**
	 * Обработать прогресс загрузки изображения
	 * @private
	 * @param {ProgressEvent} event событие прогресса (обязательное)
	 */
	const handleImageProgress = (event) => {
		let isNotTotalSent = true;

		if (event.lengthComputable) {
			if (isNotTotalSent) {
				allImagesTotalBytes = event.total;
				isNotTotalSent = false;
			}

			allImagesLoadedBytes += event.loaded;
		}

		console.log('allImagesTotalBytes', allImagesTotalBytes);
		console.log('allImagesLoadedBytes', allImagesLoadedBytes);
	};

	/**
	 * Добавить слушатель события загрузки изображения
	 * @private
	 * @param {XMLHttpRequest} xhr запрос на загрузку (обязательное)
	 * @param {HTMLImageElement} image элемент изображения (обязательное)
	 * @param {string} url ссылка на источник изображения (обязательное)
	 */
	const addImageLoadListener = ({xhr, image, url}) => {
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
	};

	/**
	 * Добавить слежение за загрузкой изображений
	 * @private
	 */
	const addMonitoringImages = () => {
		const images = document.querySelectorAll('img[data-src]');

		for (let i = 0; i < images.length; i++) {
			let image = images[i];

			// Строка с источником (источниками) изображений
			const imageSrc = image.getAttribute('data-srcset') || image.getAttribute('data-src');

			/** Ссылка на изображение */
			const url = getBestSource(imageSrc, dpr);

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
	};

	/**
	 * Добавить слушатель события загрузки DOM
	 * @private
	 */
	const handleDomContentLoaded = () => {
		addPreloadOfPreloader();
		getSizeOfAllImages();
		addMonitoringImages();
	};

	document.addEventListener('DOMContentLoaded', handleDomContentLoaded);
};

export default {
	init,
};
