/** Проверить поддержку WebP в браузере */
export const checkWebpSupport = async () => {
	let isWebpSupport = false;

	const webP = new Image();

	// Двухпиксельный квадрат в формате WebP
	webP.src =
		'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

	await new Promise((resolve) => {
		webP.onload = () => {
			if (webP.height === 2) {
				isWebpSupport = true;
			}

			resolve();
		};

		webP.onerror = () => {
			if (webP.height === 2) {
				isWebpSupport = true;
			}

			resolve();
		};
	});

	return isWebpSupport;
};
