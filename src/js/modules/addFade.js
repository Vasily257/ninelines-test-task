import {throttle} from '../helpers';

/**
 * Добавить анимацию «Появление со смещением»
 * @public
 */
const init = () => {
	/** Корневой элемент (html) */
	const root = document.documentElement;
	/** Элементы с анимацией fade */
	const fadeElements = Array.from(root.querySelectorAll('.fade-hidden')) || [];
	/** Количество показанных элементов */
	let shownElements = 0;
	// Функцию для обработки скролла (ограниченная)
	let throttledHandleScroll = null;

	/**
	 * Добавить анимацию
	 * @private
	 * @param {number} scrollProgress текущее положение скролла в пикселях (обязательное)
	 */
	const addAnimation = (scrollProgress) => {
		const element = fadeElements[shownElements];

		if (element && element?.offsetTop <= scrollProgress) {
			shownElements += 1;

			element.classList.add('fade-shown');
			addAnimation(scrollProgress);
		}
	};

	/**
	 * Обработать скролл страницы
	 * @private
	 */
	const handleScroll = () => {
		addAnimation(root.scrollTop + root.clientHeight);

		// Убрать глобальный слушатель событий
		if (shownElements === fadeElements.length) {
			document.addEventListener('scroll', throttledHandleScroll);
		}
	};

	// Огранить функцию для обработки скролла
	throttledHandleScroll = throttle(handleScroll, 150);

	// Запустить анимацию для элементов, которые уже есть во вьюпорте
	addAnimation(window.innerHeight);

	// Добавить глобальный слушатель событий
	document.addEventListener('scroll', throttledHandleScroll);
};

export default {
	init,
};
