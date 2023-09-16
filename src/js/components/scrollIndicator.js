import {throttle} from '../helpers';

/**
 * Инициализировать страницу
 * @public
 */
const init = () => {
	/** Корневой элемент (html) */
	const root = document.documentElement;
	/** Элемент индикатора скролла */
	const scrollIndicator = root.querySelector('.scroll-indicator');
	/** Элемент стрелки внутри индикатора */
	const arrow = scrollIndicator.querySelector('.scroll-indicator__arrow');

	/**
	 * Обновить цвет границы индикатора
	 * @private
	 * @param {number} percentages прогресс скролла в процентах (обязательное)
	 */
	const updateIndicatorBorder = (percentages) => {
		const startColor = '#d2233c';
		const endColor = '#282a33';
		const conicGradientValue = `${startColor} 0 ${percentages}%, ${endColor} ${percentages}% 100%`;

		scrollIndicator.style.backgroundImage = `conic-gradient(${conicGradientValue})`;
	};

	/**
	 * Обновить значение индикатора
	 * @private
	 * @param {number} percentages прогресс скролла в процентах (обязательное)
	 */
	const updateIndicatorValue = (percentages) => {
		if (percentages === 100) {
			scrollIndicator.setAttribute('data-percentages', '');

			scrollIndicator.classList.add('js-back-to-top');
			scrollIndicator.classList.add('scroll-indicator--cursor-pointer');
			scrollIndicator.setAttribute('tabindex', '0');

			arrow.classList.add('scroll-indicator__arrow--shown');
		} else {
			if (arrow.classList.contains('scroll-indicator__arrow--shown')) {
				arrow.classList.remove('scroll-indicator__arrow--shown');

				scrollIndicator.setAttribute('tabindex', '-1');
				scrollIndicator.classList.remove('scroll-indicator--cursor-pointer');
				scrollIndicator.classList.remove('js-back-to-top');
			}

			scrollIndicator.setAttribute('data-percentages', `${percentages} %`);
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
