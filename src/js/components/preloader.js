import {getBestSource} from '../modules/srcSet';
import {checkWebpSupport} from '../modules/checkingWebp';

/**
 * Инициализировать страницу
 * @public
 */
const init = () => {
	/** Количество байтов всех изображений */
	const imagesBytes = {
		/** Общее количество байтов */
		total: 0,
		/** Количество загруженных байтов */
		loaded: 0,
		/** Количество загруженных байтов, индексированные по URL изображения */
		indexedbyUrlLoaded: {},
	};

	/** Инициализированные запросы для загрузки изображений */
	const uploadingXhrList = [];
	/** Временные URL для загрузки BLOB-изображений */
	const blobUrlList = [];

	/** Соотношение виртуальных и физических пикселей */
	const dpr = window.devicePixelRatio;
	/** Поддерживает ли браузер WebP */
	let isBrowserWebpSupport = false;

	/** Корневой элемент (html) */
	const root = document.documentElement;
	/** Элемент обертки прелоадера */
	const preloaderWrapper = root.querySelector('.preloader');
	/** Элемент изображения прелоадера */
	const preloaderImage = preloaderWrapper.querySelector('.preloader__image');

	/** Конечные позиции прелоадера */
	const preloaderEnd = {
		x: root.clientWidth + preloaderImage.clientWidth,
		y: root.clientHeight + preloaderImage.clientHeight,
	};

	/**
	 * Проверить, поддерживает ли браузер формат WebP
	 * @private
	 */
	const checkWebpBrowserSupport = async () => {
		isBrowserWebpSupport = await checkWebpSupport();
	};

	/**
	 * Отключить скролл на странице
	 * @private
	 */
	const disableScroll = () => {
		root.classList.add('is-lock-scroll');
	};

	/**
	 * Включить скролл на странице
	 * @private
	 */
	const enableScroll = () => {
		root.classList.remove('is-lock-scroll');
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
			enableScroll();
			hidePreloader();

			localStorage.setItem('preloaderStatus', 'shown');
		}
	};

	/**
	 * Инициализировать запрос для получения размер изображения
	 * @private
	 * @param {string} url путь к изображению (обязательное)
	 */
	const initGettingSizeFetch = async (url) => {
		try {
			const response = await fetch(url, {method: 'HEAD'});

			if (!response.ok) {
				throw new Error(`Ошибка при запросе метаданных для изображения: ${url}`);
			}

			/** Размер изображения в байтах */
			const contentLength = response.headers.get('Content-Length');

			// Обновить общий размер изображений
			if (contentLength) {
				imagesBytes.total += parseInt(contentLength, 10);
			}
		} catch (error) {
			throw new Error(`Не удалось получить размер для изображения: ${url}`);
		}
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
			if (!imagesBytes.indexedbyUrlLoaded[url]) {
				imagesBytes.indexedbyUrlLoaded[url] = 0;
			}

			if (event.lengthComputable) {
				// Обновить количество загруженных байт для всех изображений
				imagesBytes.loaded -= imagesBytes.indexedbyUrlLoaded[url];
				imagesBytes.loaded += event.loaded;

				// Обновить количество загруженных байт для текущего изображения
				imagesBytes.indexedbyUrlLoaded[url] = event.loaded;

				// Обновить положение прелоадера
				if (!localStorage.getItem('preloaderStatus')) {
					updatePreloaderPosition(imagesBytes.loaded / imagesBytes.total);
				}
				// Не использован requestAnimationFrame, так как при низкой скорости интернета
				// прелодаер моментально переходит в правое верхнее положение
			}
		};

		uploadingXhr.onload = () => {
			if (uploadingXhr.status === 200) {
				// Создать временный BLOB-URL и присвоить его изображению
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
	const loadAllImages = async () => {
		const images = document.querySelectorAll('img[data-src]');

		// Если изображений нет, то не загружать их
		if (images.length === 0) {
			return;
		}

		/** Инициализированные запросы для получения веса изображений */
		const gettingSizeFetchList = [];

		for (let i = 0; i < images.length; i++) {
			const image = images[i];

			// Строка с источником (источниками) изображений
			const imageSrc = `${image.getAttribute('data-srcset')}, ${image.getAttribute('data-src')}`;

			/** Ссылка на изображение */
			const url = getBestSource(imageSrc, dpr, isBrowserWebpSupport);

			gettingSizeFetchList.push(initGettingSizeFetch(url));

			// Добавить запрос для загрузки изображения в список,
			// чтобы отправить его после получения веса всех изображений
			uploadingXhrList.push(initUploadingXhr(url, image));
		}

		await Promise.all(gettingSizeFetchList);

		uploadingXhrList.forEach((xhr) => xhr.send());
	};

	/**
	 * Обработать загрузку DOM
	 * @private
	 */
	const handleDomContentLoaded = async () => {
		disableScroll();

		await checkWebpBrowserSupport();

		if (!localStorage.getItem('preloaderStatus')) {
			addPreloadOfPreloader();
		} else {
			hidePreloader();
			enableScroll();
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
