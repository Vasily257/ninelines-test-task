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

	/** Количество загруженных BLOB-изображений */
	let loadedBlobImages = 0;

	/** Конечные позиции прелоадера */
	const preloaderEnd = {
		x: root.clientWidth + preloaderImage.clientWidth,
		y: root.clientHeight + preloaderImage.clientHeight,
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
		if (!preloaderWrapper.classList.contains('preloader--hidden')) {
			preloaderWrapper.classList.add('preloader--hidden');
		}
	};

	/**
	 * Получить информацию по изображения (URL и ссылку на элемент изображения)
	 * @private
	 */
	const getImageInfoList = () => {
		const images = document.querySelectorAll('img[data-src]');
		const imageInfoList = [];

		for (const image of images) {
			const imageSrc = `${image.getAttribute('data-srcset')}, ${image.getAttribute('data-src')}`;
			const url = getBestSource(imageSrc, dpr, isBrowserWebpSupport);

			imageInfoList.push({
				url,
				image,
			});
		}

		return imageInfoList;
	};

	/**
	 * Получить размер изображения
	 * @private
	 * @param {string} url путь к изображению (обязательное)
	 */
	const fetchGettingSize = async (url) => {
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
	 * Обновить значения байтов
	 * @private
	 * @param {string} url URL изображение (обязательное)
	 * @param {number} value текущее значение загруженных байт изображения (обязательное)
	 */
	const updateLoadedBytes = (url, value) => {
		// Добавить URL изображения в объект, если это первое чтение потока
		if (!imagesBytes.indexedbyUrlLoaded[url]) {
			imagesBytes.indexedbyUrlLoaded[url] = 0;
		}

		// Обновить количество загруженных байт для всех изображений
		imagesBytes.loaded -= imagesBytes.indexedbyUrlLoaded[url];
		imagesBytes.loaded += value.length;

		// Обновить количество загруженных байт для текущего изображения
		imagesBytes.indexedbyUrlLoaded[url] = value.length;
	};

	/**
	 * Переместить прелоадер
	 * @private
	 * @param {number} progress коэффициент перемещения прелоадера (обязательное)
	 */
	const updatePreloaderPosition = (progress) => {
		const currentX = preloaderEnd.x * progress;
		const currentY = preloaderEnd.y * progress * -1;

		preloaderImage.style.transform = `translate(${currentX}px, ${currentY}px)`;
	};

	/**
	 * Создать функцию, которая будет обрабатывать загрузку изображения
	 * @private
	 * @param {HTMLElement} image ссылка на элемент изображения (обязательное)
	 * @param {string} imgObjectURL строка с адресом изображения (обязательное)
	 * @param {number} imageCount количество всех изображений (обязательное)
	 */
	const createHandleImageLoad = (image, imgObjectURL, imageCount) => {
		return function handleImageLoad() {
			// Удалить временную BLOB-ссылку после загрузки изображения
			URL.revokeObjectURL(imgObjectURL);

			// Увеличить счетчик загруженных изображений
			loadedBlobImages += 1;

			// Скрыть прелоадер, если последнее изображение загрузилось
			if (loadedBlobImages === imageCount) {
				localStorage.setItem('preloaderStatus', 'shown');

				hidePreloader();
				enableScroll();
			}

			// Удалить обработчик после завершения запроса
			image.removeEventListener('load', handleImageLoad);
		};
	};

	/**
	 * Загрузить одно изображение и отследить прогресс загрузки
	 * @private
	 * @param {string} url путь к изображению (обязательное)
	 * @param {HTMLImageElement} image элемент изображения (обязательное)
	 * @param {number} imageCount количество всех изображений (обязательное)
	 */
	const fetchUploading = async (url, image, imageCount) => {
		try {
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`Ошибка загрузки изображения: ${url}`);
			}

			/** Поток данных изображения */
			const reader = response.body.getReader();
			/** Части потока данных */
			const chunks = [];

			// В Streams API есть асинхронный перебор цикла,
			// но он плохо поддерживается, поэтому используется while
			// eslint-disable-next-line no-constant-condition
			while (true) {
				const {done, value} = await reader.read();

				if (done) {
					break;
				}

				chunks.push(value);

				// Получить новое значение загруженных байт, чтобы обновить положение прелоадера
				updateLoadedBytes(url, value);

				// Обновить положение прелоадера
				if (!localStorage.getItem('preloaderStatus')) {
					updatePreloaderPosition(imagesBytes.loaded / imagesBytes.total);
				}
				// Не используется requestAnimationFrame, так как при низкой скорости интернета
				// прелодаер моментально переходит в правое верхнее положение
			}

			// Создать BLOB-изображениt на основе потока данных
			const contentType = response.headers.get('content-type');
			const imgBlob = new Blob(chunks, {type: contentType});

			// Создать временную BLOB-ссылку и загрузить по ней изображение
			const imgObjectURL = URL.createObjectURL(imgBlob);
			image.src = imgObjectURL;

			// Обработать загрузку BLOB-изображений
			const handleImageLoad = createHandleImageLoad(image, imgObjectURL, imageCount);
			image.addEventListener('load', handleImageLoad);
		} catch (error) {
			throw new Error(`Ошибка загрузки изображения: ${url}`);
		}
	};

	/**
	 * Добавить слежение за загрузкой изображений
	 * @private
	 */
	const loadAllImages = async () => {
		const imageInfoList = getImageInfoList();

		// Если изображений нет, то не загружать их
		if (imageInfoList.length === 0) {
			return;
		}

		// Запустить запросы для получения размера изображений
		imageInfoList.forEach((imageInfo) => fetchGettingSize(imageInfo.url));

		// Запустить запросы для загрузки самих изображений
		for (let i = 0; i < imageInfoList.length; i++) {
			const imageInfo = imageInfoList[i];

			fetchUploading(imageInfo.url, imageInfo.image, imageInfoList.length);
		}
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
		}

		await loadAllImages();

		document.removeEventListener('DOMContentLoaded', handleDomContentLoaded);
	};

	// Добавить глобальный слушатель событий
	document.addEventListener('DOMContentLoaded', handleDomContentLoaded);
};

export default {
	init,
};
