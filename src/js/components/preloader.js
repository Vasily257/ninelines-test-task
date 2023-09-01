import {getBestSource} from '../modules/srcSet';
import {checkWebpSupport} from '../modules/checkingWebp';

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

	/** Элемент обертки прелоадера */
	const preloaderWrapper = document.querySelector('.preloader');
	/** Элемент изображения прелоадера */
	const preloaderImage = preloaderWrapper.querySelector('.preloader__image');

	/** Конечные позиция прелоадера */
	const preloaderEnd = {
		x: screen.availWidth + preloaderImage.clientWidth,
		y: screen.availHeight + preloaderImage.clientHeight,
	};

	/**
	 * Проверить, поддерживает ли браузер формат WebP
	 * @private
	 */
	const checkWebpBrowserSupport = async () => {
		isBrowserWebpSupport = await checkWebpSupport();
	};

	/**
	 * Добавить предварительную загрузку прелоадера
	 * @private
	 */
	const addPreloadOfPreloader = () => {
		const preloaderSrc =
			'./images/guy-on-rocket.webp, ./images/guy-on-rocket@2x.webp 2x, ./images/guy-on-rocket.png, ./images/guy-on-rocket@2x.png 2x,';

		// Подготовить ссылку на прелоадер
		const preloadLink = document.createElement('link');
		preloadLink.rel = 'preload';
		preloadLink.href = getBestSource(preloaderSrc, dpr, isBrowserWebpSupport);
		preloadLink.as = 'image';

		// Добавить ссылку в head
		document.head.appendChild(preloadLink);
	};

	/**
	 * Скрыть прелоадер
	 * @private
	 */
	const hidePreloader = () => {
		preloaderWrapper.classList.add('preloader--hidden');
	};

	/**
	 * Переместить прелоадер
	 * @private
	 * @param {number} progress коэффициент перемещения прелоадера
	 */
	const updatePreloaderPosition = (progress) => {
		const currentX = preloaderEnd.x * progress;
		const currentY = preloaderEnd.y * progress * -1;

		preloaderImage.style.transform = `translate(${currentX}px, ${currentY}px)`;

		if (progress === 1) {
			hidePreloader();

			localStorage.setItem('preloaderStatus', 'shown');
		}
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

				// Запустить запросы для загрузки изображений, если
				// завершился последний запрос для получения веса изображений
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
			// Добавить URL в объект, если это первый запрос прогресса
			if (!indexImagesLoadedBytes[url]) {
				indexImagesLoadedBytes[url] = 0;
			}

			if (event.lengthComputable) {
				// Обновить количество загруженных байт для всех изображений
				imagesLoadedBytes -= indexImagesLoadedBytes[url];
				imagesLoadedBytes += event.loaded;

				// Обновить количество загруженных байт для текущего изображения
				indexImagesLoadedBytes[url] = event.loaded;

				// Обновить положение прелоадера
				if (!localStorage.getItem('preloaderStatus')) {
					updatePreloaderPosition(imagesLoadedBytes / imagesTotalBytes);
				}
				// Не использован requestAnimationFrame, так как при низкой скорости интернета
				// прелодаер моментально переходит в правое верхнее положение
			}
		};

		uploadingXhr.onload = () => {
			if (uploadingXhr.status === 200) {
				// Создать временный BLOB-URL и присводить его изображению
				const blob = uploadingXhr.response;
				const imgObjectURL = URL.createObjectURL(blob);
				image.src = imgObjectURL;

				// Добавить BLOB-URL в список, чтобы потом удалить его
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

		// Если изображений нет, то не загружать их
		if (images.length === 0) {
			return;
		}

		/** Инициализированные запросы для получения веса изображений */
		const gettingSizeXhrList = [];

		for (let i = 0; i < images.length; i++) {
			const image = images[i];

			// Строка с источником (источниками) изображений
			const imageSrc = `${image.getAttribute('data-srcset')}, ${image.getAttribute(
				'data-src',
			)}`;

			/** Ссылка на изображение */
			const url = getBestSource(imageSrc, dpr, isBrowserWebpSupport);

			// Если изображение последнее, то добавить пометку в запросе
			if (i === images.length - 1) {
				gettingSizeXhrList.push(initGettingSizeXhr(url, true));
			} else {
				gettingSizeXhrList.push(initGettingSizeXhr(url));
			}

			// Добавить запрос для загрузки изображения в список,
			// чтобы отправить его после получения веса всех изображений
			uploadingXhrList.push(initUploadingXhr(url, image));
		}

		// Запустить запросы для получения веса изображений
		for (let i = 0; i < gettingSizeXhrList.length; i++) {
			const gettingSizeXhr = gettingSizeXhrList[i];
			gettingSizeXhr.send();
		}
	};

	/**
	 * Обработать загрузку DOM
	 * @private
	 */
	const handleDomContentLoaded = async () => {
		await checkWebpBrowserSupport();

		if (!localStorage.getItem('preloaderStatus')) {
			addPreloadOfPreloader();
		} else {
			hidePreloader();
		}

		loadAllImages();
	};

	/**
	 * Обработать загрузку страницы
	 * @private
	 */
	const handlePageLoad = () => {
		// Удалить временные URL BLOB-изображений
		blobUrlList.forEach(URL.revokeObjectURL);
	};

	// Добавить глобальные слушатели событий
	document.addEventListener('DOMContentLoaded', handleDomContentLoaded);
	window.addEventListener('load', handlePageLoad);
};

export default {
	init,
};
