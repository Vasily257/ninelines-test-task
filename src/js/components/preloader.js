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
					// Вернуть ссылку на изображение и его размер, если запрос успешный
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
	 * Загрузить одно изображение и отследить прогресс загрузки
	 * @private
	 * @param {string} url путь к изображению (обязательное)
	 * @param {HTMLImageElement} image элемент изображения (обязательное)
	 */
	const loadOneImage = (url) => {
		return new Promise((resolve, reject) => {
			/** Инициализация запроса */
			const xhr = new XMLHttpRequest();

			// Установить типа ответа на BLOB
			xhr.responseType = 'blob';

			/** Количество байт, загруженное в данный момент */
			let imageLoadedBytes = 0;

			// Выполнить запрос, чтобы загрузить изображение
			xhr.open('GET', url, true);

			// Следить за прогрессом загрузки и обновлять количество загруженных байт
			xhr.onprogress = (event) => {
				if (event.lengthComputable) {
					imageLoadedBytes = event.loaded;
					console.log(`Загружено байт ${url}: ${imageLoadedBytes}`);
				}
			};

			xhr.onload = () => {
				if (xhr.status === 200) {
					resolve(xhr.response);
					console.log('Изображение загружено');
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
		let imageUrls = [];

		for (let i = 0; i < images.length; i++) {
			const image = images[i];

			// Строка с источником (источниками) изображений
			const imageSrc = image.getAttribute('data-srcset') || image.getAttribute('data-src');

			/** Ссылка на изображение */
			const url = getBestSource(imageSrc, dpr);

			imageUrls.push(url);
		}

		Promise.all(imageUrls.map(getSizeOfOneImage))
			.then((metadataArray) => {
				let totalSize = 0;
				metadataArray.forEach((metadata) => {
					totalSize += metadata.size;
				});

				console.log(`Общий размер изображений: ${totalSize} байт`);

				const loadImagePromises = metadataArray.map((metadata) =>
					loadOneImage(metadata.url),
				);

				Promise.all(loadImagePromises)
					.then((response) => {
						const blob = response;
						const imgObjectURL = URL.createObjectURL(blob);
						image.src = imgObjectURL;
						console.log('Все изображения загружены');
					})
					.catch((error) => {
						console.error('Ошибка при загрузке изображений:', error);
					});
			})
			.catch((error) => {
				console.error('Ошибка при получении метаданных изображений:', error);
			});
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
