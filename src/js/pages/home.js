import {getBestSource} from '../modules/srcSet';

let allImagesTotalBytes;
let allImagesLoadedBytes;

/**
 * Обработать прогресс загрузки изображения
 * @private
 * @param {ProgressEvent} event событие прогресса
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
 * @param {XMLHttpRequest} xhr запрос на загрузку
 * @param {HTMLImageElement} image элемент изображения
 * @param {string} url ссылка на источник изображения
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
 * Инициализировать страницу
 * @public
 */
function init() {
	document.addEventListener('DOMContentLoaded', async () => {
		const images = document.querySelectorAll('img[data-src]');
		const dpr = window.devicePixelRatio;

		for (let i = 0; i < images.length; i++) {
			let image = images[i];

			/** Ссылка на изображение */
			const url = getBestSource(image, dpr);

			/** Инициализация запроса */
			const xhr = new XMLHttpRequest();

			// Выполнить запрос
			xhr.open('GET', url, true);

			// Перевести изображение в формат BLOB
			xhr.responseType = 'blob';

			// Добавить слушатель прогресса
			xhr.addEventListener('progress', handleImageProgress);

			// Добавить слушатель загрузки
			addImageLoadListener({
				xhr,
				image,
				url,
			});

			xhr.send();
		}
	});
}

export default {
	init,
};
