import {getBestSource, checkWebpSupport} from '../modules/srcSet';

/**
 * Инициализировать страницу
 * @public
 */
const init = () => {
	/** Количество всех байт изображений */
	let imagesTotalBytes = 0;
	/** Количество загруженных байт изображений */
	let imagesLoadedBytes = 0;
	/** Количество загруженных байт изображений, индексированные по URL изображения */
	const indexImagesLoadedBytes = {};
	/** Инициализированные запросы для загрузки изображений */
	const uploadingXhrList = [];
	/** Временные URL для загрузки BLOB-изображений */
	const blobUrlList = [];

	/** Соотношение виртуальных и физических пикселей */
	const dpr = window.devicePixelRatio;
	/** Поддерживает ли браузер WebP */
	let isBrowserWebpSupport = false;

	/**
	 * Добавить предварительную загрузку прелоадера
	 * @private
	 */
	const addPreloadOfPreloader = () => {
		const preloaderSrc =
			'./images/guy-on-rocket.webp, ./images/guy-on-rocket@2x.webp 2x, ./images/guy-on-rocket.png, ./images/guy-on-rocket@2x.png 2x,';
		const preloadLink = document.createElement('link');

		preloadLink.rel = 'preload';
		preloadLink.href = getBestSource(preloaderSrc, dpr, isBrowserWebpSupport);
		preloadLink.as = 'image';

		document.head.appendChild(preloadLink);
	};

	/**
	 * Получить размер одного изображения
	 * @private
	 * @param {string} url путь к изображению (обязательное)
	 * @param {boolean} isLastOne является ли изображение последним на странице (необязательное)
	 */
	const initGettingSizeXhr = (url, isLastOne = false) => {
		/** Инициализация запроса */
		const gettingSizeXhr = new XMLHttpRequest();

		// Выполнить запрос, чтобы получить метаданные изображения
		gettingSizeXhr.open('HEAD', url, true);

		gettingSizeXhr.onload = () => {
			/** Размер изображения в байтах */
			const contentLength = gettingSizeXhr.getResponseHeader('Content-Length');

			if (contentLength) {
				imagesTotalBytes += parseInt(contentLength, 10);

				if (isLastOne) {
					uploadingXhrList.forEach((xhr) => xhr.send());
				}
			} else {
				throw new Error(`Не удалось получить размер для изображения: ${url}`);
			}
		};

		gettingSizeXhr.onerror = () => {
			throw new Error(`Ошибка при запросе метаданных для изображения: ${url}`);
		};

		return gettingSizeXhr;
	};

	/**
	 * Загрузить одно изображение и отследить прогресс загрузки
	 * @private
	 * @param {string} url путь к изображению (обязательное)
	 * @param {HTMLImageElement} image элемент изображения (обязательное)
	 */
	const initUploadingXhr = (url, image) => {
		/** Инициализация запроса */
		const uploadingXhr = new XMLHttpRequest();

		// Установить типа ответа на BLOB
		uploadingXhr.responseType = 'blob';

		// Выполнить запрос, чтобы загрузить изображение
		uploadingXhr.open('GET', url, true);

		// Следить за прогрессом загрузки и обновлять количество загруженных байт
		uploadingXhr.onprogress = (event) => {
			if (!indexImagesLoadedBytes?.url) {
				indexImagesLoadedBytes[url] = 0;
			}

			if (event.lengthComputable) {
				imagesLoadedBytes -= indexImagesLoadedBytes[url];

				indexImagesLoadedBytes[url] = event.loaded;
				imagesLoadedBytes += event.loaded;
			}
		};

		uploadingXhr.onload = () => {
			if (uploadingXhr.status === 200) {
				const blob = uploadingXhr.response;

				// Создать временный URL и присводить его изображению
				const imgObjectURL = URL.createObjectURL(blob);
				image.src = imgObjectURL;

				blobUrlList.push(imgObjectURL);
			} else {
				throw new Error(`Ошибка загрузки изображения: ${url}`);
			}
		};

		uploadingXhr.onerror = () => {
			throw new Error(`Ошибка загрузки изображения: ${url}`);
		};

		return uploadingXhr;
	};

	/**
	 * Добавить слежение за загрузкой изображений
	 * @private
	 */
	const loadAllImages = () => {
		const images = document.querySelectorAll('img[data-src]');

		if (images.length === 0) {
			return;
		}

		const gettingSizeXhrList = [];

		for (let i = 0; i < images.length; i++) {
			const image = images[i];

			// Строка с источником (источниками) изображений
			const imageSrc = `${image.getAttribute('data-src')}, ${image.getAttribute(
				'data-srcset',
			)}`;

			/** Ссылка на изображение */
			const url = getBestSource(imageSrc, dpr, isBrowserWebpSupport);

			// Если изображение последнее, то добавить пометку в запросе
			if (i === images.length - 1) {
				gettingSizeXhrList.push(initGettingSizeXhr(url, true));
			} else {
				gettingSizeXhrList.push(initGettingSizeXhr(url));
			}

			uploadingXhrList.push(initUploadingXhr(url, image));
		}

		for (let i = 0; i < gettingSizeXhrList.length; i++) {
			const gettingSizeXhr = gettingSizeXhrList[i];
			gettingSizeXhr.send();
		}
	};

	/**
	 * Добавить слушатель события загрузки DOM
	 * @private
	 */
	const handleDomContentLoaded = async () => {
		isBrowserWebpSupport = await checkWebpSupport();

		addPreloadOfPreloader();
		loadAllImages();
	};

	document.addEventListener('DOMContentLoaded', handleDomContentLoaded);

	window.addEventListener('load', () => {
		// Удалить временные URL BLOB-изображений
		blobUrlList.forEach(URL.revokeObjectURL);
	});
};

export default {
	init,
};
