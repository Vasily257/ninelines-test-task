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

			/** Выполнить запрос */
			xhr.open('GET', url, true);

			/** Перевести изображение в формат BLOB */
			xhr.responseType = 'blob';

			/** Выполнить код во время загрузки изображения */
			xhr.addEventListener('progress', handleImageProgress);

			const handleImageUpload = () => {
				if (xhr.status === 200) {
					const blob = xhr.response;
					const imgObjectURL = URL.createObjectURL(blob);
					image.src = imgObjectURL;
				} else {
					throw new Error(`Ошибка загрузки изображения ${url}. Статус: ${xhr.status}`);
				}
			};

			/** Выполнить код после загрузки изображения */
			xhr.addEventListener('load', handleImageUpload);

			xhr.send();
		}
	});
}

export default {
	init,
};
