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
	 * Получить размер одного изображения
	 * @private
	 * @param {string} url путь к изображению (обязательное)
	 * @param {HTMLImageElement} image элемент изображения (обязательное)
	 */
	const loadOneImage = (url, image) => {
		return new Promise((resolve, reject) => {
			/** Инициализация запроса */
			const xhr = new XMLHttpRequest();

			let imageLoadedBytes = 0;

			// Выполнить запрос, чтобы получить метаданные изображения
			xhr.open('GET', url, true);

			xhr.onprogress = (event) => {
				if (event.lengthComputable) {
					imageLoadedBytes = event.loaded;
					console.log(`Загружено байт ${url}: ${imageLoadedBytes}`);
				}
			};

			xhr.onload = () => {
				if (xhr.status === 200) {
					const blob = xhr.response;
					const imgObjectURL = URL.createObjectURL(blob);
					image.src = imgObjectURL;
				} else {
					reject(new Error(`Ошибка загрузки изображения: ${url}`));
				}
			};

			xhr.onerror = () => {
				reject(new Error(`Ошибка загрузки изображения: ${url}`));
			};

			xhr.send();
		});
	};

	/**
	 * Добавить слежение за загрузкой изображений
	 * @private
	 */
	const loadAllImages = async () => {
		const images = document.querySelectorAll('img[data-src]');

		let gettingSizePromises = [];
		let uploadPromises = [];

		for (let i = 0; i < images.length; i++) {
			let image = images[i];

			// Строка с источником (источниками) изображений
			const imageSrc = image.getAttribute('data-srcset') || image.getAttribute('data-src');

			/** Ссылка на изображение */
			const url = getBestSource(imageSrc, dpr);

			gettingSizePromises.push(getSizeOfOneImage(url));
			uploadPromises.push(loadOneImage(url, image));
		}

		const imageInfoList = await Promise.all(gettingSizePromises);

		allImagesTotalBytes = imageInfoList.reduce((acc, imageInfo) => acc + imageInfo.size, 0);

		await Promise.all(uploadPromises);
	};

	/**
	 * Добавить слушатель события загрузки DOM
	 * @private
	 */
	const handleDomContentLoaded = () => {
		addPreloadOfPreloader();
		loadAllImages();
	};

	document.addEventListener('DOMContentLoaded', handleDomContentLoaded);
};

export default {
	init,
};
