import {throttle} from '../helpers';

/**
 * Инициализировать страницу
 * @public
 */
const init = () => {
	/** Корневой элемент (html) */
	const root = document.documentElement;
	/** Элемент индикатора скролла */
	const pageScrollIndicator = root.querySelector('.page-scroll');
	/** Элемент стрелки внутри индикатора */
	const arrow = pageScrollIndicator.querySelector('.page-scroll__arrow');

	/**
	 * Обновить значение процентов в индикаторе скролла
	 * @private
	 */
	const updateScrollIndicator = () => {
		const currentScrollHeight = root.scrollTop + root.clientHeight;
		const percentages = Math.round(currentScrollHeight / root.scrollHeight * 100);

		if (percentages === 100) {
			pageScrollIndicator.setAttribute('data-percentages', '');

			arrow.classList.add('page-scroll__arrow--shown');
		} else {
			if (arrow.classList.contains('page-scroll__arrow--shown')) {
				arrow.classList.remove('page-scroll__arrow--shown');
			}

			pageScrollIndicator.setAttribute('data-percentages', `${percentages} %`);
		}
	};

	/**
	 * Вызвать функцию для обновления процентов (с интервалом)
	 * @private
	 */
	const throttledupdateScrollIndicator = throttle(updateScrollIndicator, 150);

	/**
	 * Обработать скролл страницы
	 * @private
	 */
	const handleScroll = () => {
		throttledupdateScrollIndicator();
	};

	// Обновить начальное значение индикатора
	updateScrollIndicator();

	// Добавить глобальные слушатели событий
	document.addEventListener('scroll', handleScroll);
};

export default {
	init,
};
