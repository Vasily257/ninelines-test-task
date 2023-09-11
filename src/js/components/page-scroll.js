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
	 * Обновить цвет границы индикатора
	 * @private
	 * @param {number} percentages прогресс скролла в процентах (обязательное)
	 */
	const updateIndicatorBorder = (percentages) => {
		const startColor = '#d2233c';
		const endColor = '#282a33';
		const conicGradientValue = `${startColor} 0 ${percentages}%, ${endColor} ${percentages}% 100%`;

		pageScrollIndicator.style.backgroundImage = `conic-gradient(${conicGradientValue})`;
	};

	/**
	 * Обновить значение индикатора
	 * @private
	 * @param {number} percentages прогресс скролла в процентах (обязательное)
	 */
	const updateIndicatorValue = (percentages) => {
		if (percentages === 100) {
			pageScrollIndicator.setAttribute('data-percentages', '');

			pageScrollIndicator.classList.add('js-back-to-top');
			pageScrollIndicator.classList.add('page-scroll--cursor-pointer');
			arrow.classList.add('page-scroll__arrow--shown');
		} else {
			if (arrow.classList.contains('page-scroll__arrow--shown')) {
				arrow.classList.remove('page-scroll__arrow--shown');

				pageScrollIndicator.classList.remove('page-scroll--cursor-pointer');
				pageScrollIndicator.classList.remove('js-back-to-top');
			}

			pageScrollIndicator.setAttribute('data-percentages', `${percentages} %`);
		}
	};

	/**
	 * Обновить значение процентов в индикаторе скролла
	 * @private
	 */
	const updateScrollIndicator = () => {
		const currentScrollHeight = root.scrollTop + root.clientHeight;
		const percentages = Math.round(currentScrollHeight / root.scrollHeight * 100);

		updateIndicatorValue(percentages);
		updateIndicatorBorder(percentages);
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

	// Добавить глобальный слушатель событий
	document.addEventListener('scroll', handleScroll);
};

export default {
	init,
};
